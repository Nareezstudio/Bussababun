const prisma = require('../lib/prisma');

const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now }, // เริ่มต้นแล้ว (startDate <= now)
        endDate: { gte: now },   // ยังไม่หมดอายุ (endDate >= now)
      },
      include: {
        novel: {
          select: {
            title: true,
            coverImage: true,
            author: { select: { username: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching promotions", error: error.message });
  }
};

/**
 * ฟังก์ชันคำนวณราคาหลังหักส่วนลด
 * @param {number} fullPrice - ราคาเต็มของตอนนิยาย
 * @param {Object} promotion - ข้อมูลโปรโมชั่นจาก DB
 * @returns {number} - ราคาที่หักส่วนลดแล้ว (ไม่ต่ำกว่า 0)
 */
const calculateDiscountedPrice = (fullPrice, promotion) => {
  if (!promotion) return fullPrice;

  let finalPrice = fullPrice;

  if (promotion.discountType === 'PERCENT') {
    // เช่น ลด 20% จาก 10 เหรียญ = 8 เหรียญ
    const discount = (fullPrice * promotion.discountValue) / 100;
    finalPrice = fullPrice - discount;
  } else if (promotion.discountType === 'COIN') {
    // เช่น ลด 2 เหรียญ จาก 10 เหรียญ = 8 เหรียญ
    finalPrice = fullPrice - promotion.discountValue;
  }

  // ป้องกันราคาติดลบ และปัดเศษ (ถ้ามี)
  return Math.max(0, Math.floor(finalPrice));
};

const purchaseChapter = async (req, res) => {
  const { chapterId, userId } = req.body;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      novel: {
        include: {
          promotions: {
            where: { isActive: true, endDate: { gte: new Date() } }
          }
        }
      }
    }
  });

  // เลือกโปรโมชั่นแรกที่เจอ (หรือจะเขียน Logic เลือกตัวที่คุ้มที่สุดก็ได้)
  const activePromo = chapter.novel.promotions[0];
  const finalPrice = calculateDiscountedPrice(chapter.price, activePromo);

  // ต่อจากนี้คือ Logic หักเหรียญ User และบันทึก Transaction...
  console.log(`ราคาเต็ม: ${chapter.price}, ราคาหลังลด: ${finalPrice}`);
};

// ✅ 1. สร้างโปรโมชั่นใหม่ (รองรับ 3 ประเภท)
exports.createPromotion = async (req, res) => {
    try {
        const { 
            novelId, name, type, discountType, 
            discountValue, startDate, endDate, promoCode 
        } = req.body;
        const userId = req.user.id;

        // ตรวจสอบสิทธิ์เจ้าของนิยาย
        const novel = await prisma.novel.findUnique({
            where: { id: novelId }
        });

        if (!novel || novel.authorId !== userId) {
            return res.status(403).json({ message: "คุณไม่มีสิทธิ์จัดการนิยายเรื่องนี้" });
        }

        // ตรวจสอบความถูกต้องของวันที่
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({ message: "วันเริ่มต้นต้องก่อนวันสิ้นสุด" });
        }

        // กรณีเลือกประเภท CODE ต้องเช็คว่าโค้ดซ้ำไหม
        if (type === 'CODE') {
            if (!promoCode) return res.status(400).json({ message: "กรุณาระบุรหัสส่วนลด" });
            const existingCode = await prisma.promotion.findFirst({
                where: { promoCode: promoCode.toUpperCase(), isActive: true }
            });
            if (existingCode) return res.status(400).json({ message: "รหัสส่วนลดนี้ถูกใช้งานแล้ว" });
        }

        // สร้าง Promotion
        const promotion = await prisma.promotion.create({
            data: {
                name,
                type, // EPISODE, FULL, CODE
                discountType, // PERCENT, COIN
                discountValue: parseFloat(discountValue),
                startDate: start,
                endDate: end,
                promoCode: type === 'CODE' ? promoCode.toUpperCase() : null,
                novelId,
                isActive: true
            }
        });

        res.status(201).json({ success: true, promotion });
    } catch (error) {
        console.error("Create Promo Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ 2. ตรวจสอบคูปอง (สำหรับคนอ่านกรอกโค้ด)
exports.checkCoupon = async (req, res) => {
    try {
        const { code, novelId } = req.body;
        const now = new Date();

        const promo = await prisma.promotion.findFirst({
            where: {
                promoCode: code.toUpperCase(),
                type: 'CODE',
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                // ถ้าโค้ดนี้ผูกกับนิยายเฉพาะเรื่อง
                OR: [{ novelId: novelId }, { novelId: null }]
            }
        });

        if (!promo) {
            return res.status(404).json({ message: "รหัสส่วนลดไม่ถูกต้องหรือหมดอายุ" });
        }

        res.json({
            success: true,
            discount: {
                type: promo.discountType,
                value: promo.discountValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error checking coupon" });
    }
};

// ✅ 3. คำนวณราคาสุทธิ (ใช้ตอนคนอ่านเปิดอ่านตอน หรือก่อนกดยืนยันซื้อ)
exports.calculatePrice = async (req, res) => {
    try {
        const { chapterId, promoCode } = req.body;
        const now = new Date();

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { novel: true }
        });

        let currentPrice = chapter.price;
        let discountDetail = { original: chapter.price, final: chapter.price, saved: 0 };

        // 1. เช็คโปรโมชั่นแบบลดทันที (EPISODE หรือ FULL ที่ผูกกับนิยายเรื่องนี้)
        const activePromo = await prisma.promotion.findFirst({
            where: {
                novelId: chapter.novelId,
                type: { in: ['EPISODE', 'FULL'] },
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        if (activePromo) {
            if (activePromo.discountType === 'PERCENT') {
                currentPrice = currentPrice * (1 - activePromo.discountValue / 100);
            } else {
                currentPrice = Math.max(0, currentPrice - activePromo.discountValue);
            }
        }

        // 2. เช็คส่วนลดจาก Code (ถ้ามีการกรอก)
        if (promoCode) {
            const codePromo = await prisma.promotion.findFirst({
                where: {
                    promoCode: promoCode.toUpperCase(),
                    type: 'CODE',
                    isActive: true,
                    startDate: { lte: now },
                    endDate: { gte: now }
                }
            });

            if (codePromo) {
                if (codePromo.discountType === 'PERCENT') {
                    currentPrice = currentPrice * (1 - codePromo.discountValue / 100);
                } else {
                    currentPrice = Math.max(0, currentPrice - codePromo.discountValue);
                }
            }
        }

        discountDetail.final = Math.floor(currentPrice);
        discountDetail.saved = discountDetail.original - discountDetail.final;

        res.json({ success: true, ...discountDetail });
    } catch (error) {
        res.status(500).json({ message: "Calculation error" });
    }
};

// ✅ 4. ดึงรายงาน (อ้างอิง Purchase ที่เกิดในช่วงเวลา)
exports.getPromotionReport = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const userId = req.user.id;

        const promo = await prisma.promotion.findUnique({
            where: { id: promotionId },
            include: { novel: true }
        });

        if (!promo || promo.novel.authorId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const sales = await prisma.purchase.findMany({
            where: {
                novelId: promo.novelId,
                createdAt: { gte: promo.startDate, lte: promo.endDate }
            },
            include: { chapter: true, user: { select: { username: true } } }
        });

        res.json({
            name: promo.name,
            stats: {
                totalCoins: sales.reduce((sum, s) => sum + s.amount, 0),
                totalOrders: sales.length,
                sales
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Report error" });
    }
};

// ✅ 5. ดึงโปรโมชั่นของฉัน
exports.getMyPromotions = async (req, res) => {
    try {
        const userId = req.user.id;
        const promos = await prisma.promotion.findMany({
            where: { novel: { authorId: userId } },
            include: { novel: { select: { title: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: "Fetch error" });
    }
};