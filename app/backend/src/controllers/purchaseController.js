const { calculatePrice } = require('../services/discountService');
const prisma = require('../lib/prisma');

// 1. ดูราคาก่อนซื้อ (Preview)
const previewPrice = async (req, res) => {
    try {
        const { chapterId, couponCode } = req.body;
        const userId = req.user.id;

        if (!chapterId) {
            return res.status(400).json({ success: false, message: "กรุณาระบุ Chapter ID" });
        }

        const priceSummary = await calculatePrice(userId, chapterId, couponCode);

        res.json({
            success: true,
            data: priceSummary
        });
    } catch (error) {
        console.error("Preview Price Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// 2. ดำเนินการชำระเงิน (Purchase)
const executePurchase = async (req, res) => {
    const { chapterId, couponCode } = req.body;
    const userId = req.user.id;

    try {
        if (!chapterId) throw new Error("กรุณาระบุ Chapter ID");

        // คำนวณราคาสุทธิอีกครั้งเพื่อความปลอดภัย (Re-verify price)
        const priceSummary = await calculatePrice(userId, chapterId, couponCode);
        const amountToPay = priceSummary.finalPrice;

        // ดึงข้อมูลเจ้าของผลงาน
        const chapterData = await prisma.chapter.findUnique({
            where: { 
                id: chapterId.toString() // บังคับเป็น String ให้ตรงกับที่ Prisma ร้องขอ
            },
            select: { 
                novel: { select: { authorId: true } } 
            }
        });
        
        if (!chapterData) throw new Error("ไม่พบตอนนิยาย");
        const authorId = chapterData.novel.authorId;

        // เช็คว่าเป็นเจ้าของเรื่องเองหรือไม่
        if (authorId === userId) throw new Error("คุณไม่สามารถซื้อตอนนิยายของตัวเองได้");

        // เริ่มต้น Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. ตรวจสอบกระเป๋าเงินผู้ซื้อ
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { coins: true }
            });

            if (!user || user.coins < amountToPay) {
                throw new Error("เหรียญไม่พอสำหรับการสั่งซื้อนี้");
            }

            // 2. ตรวจสอบว่าเคยซื้อไปแล้วหรือยัง (ป้องกัน Double Purchase)
            const existingPurchase = await tx.purchase.findFirst({
                where: {
                    userId: userId,
                    chapterId: String(chapterId)
                }
            });
            if (existingPurchase) throw new Error("คุณเคยซื้อตอนนิยายนี้ไปแล้ว");

            // 3. ดึงค่าตั้งธรรมเนียมระบบ (Default: 60/40)
            const settings = await tx.systemSetting.findFirst() || { writerShare: 60, systemShare: 40 };
            const writerSharePercent = settings.writerShare;

            // คำนวณรายได้ (ปัดเศษทศนิยมเพื่อความแม่นยำของยอดเงิน)
            const writerRevenue = Math.floor((amountToPay * writerSharePercent) / 100);
            const systemFee = parseFloat((amountToPay - writerRevenue).toFixed(2));

            // 4. หักเงินผู้ซื้อ
            const updatedBuyer = await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: amountToPay } }
            });

            // 5. เพิ่มรายได้ให้นักเขียน
            await tx.user.update({
                where: { id: authorId },
                data: { 
                    earnings: { increment: writerRevenue },
                    income: { increment: writerRevenue }
                }
            });

            // 6. อัปเดตสถานะคูปอง (ถ้ามีการใช้)
            let appliedCouponId = null;
            if (couponCode && priceSummary.couponApplied) {
                const coupon = await tx.coupon.update({
                    where: { code: couponCode },
                    data: { usedCount: { increment: 1 } }
                });
                appliedCouponId = coupon.id;
            }

            // 7. บันทึกประวัติการซื้อ (Purchase Record)
            const purchase = await tx.purchase.create({
                data: {
                    userId,
                    chapterId: String(chapterId),
                    amount: amountToPay,
                    fullPrice: priceSummary.originalPrice,
                    discountAmount: priceSummary.totalDiscount,
                    writerShare: writerRevenue,
                    systemShare: systemFee,
                    sharePercentage: writerSharePercent,
                    couponId: appliedCouponId
                }
            });

            // 8. บันทึก Log ธุรกรรม (Transaction Log)
            await tx.transaction.create({
                data: {
                    chapterId: String(chapterId),
                    buyerId: userId,
                    writerId: authorId,
                    totalAmount: amountToPay,
                    systemFee: systemFee,
                    writerRevenue: writerRevenue,
                    //type: 'PURCHASE' // เพิ่ม Type เพื่อแยกประเภทในอนาคต
                }
            });

            return { purchase, remainingCoins: updatedBuyer.coins };
        });

        res.json({
            success: true,
            message: "ซื้อตอนนิยายสำเร็จ",
            data: result
        });

    } catch (error) {
        console.error("Purchase Transaction Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// 3. ประวัติการซื้อของผู้ใช้
const getUserPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await prisma.purchase.findMany({
            where: { userId: userId },
            include: {
                chapter: {
                    select: {
                        id: true,
                        title: true,
                        novel: {
                            select: {
                                id: true,
                                title: true,
                                coverImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(history);
    } catch (error) {
        console.error("Fetch Purchase History Error:", error);
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลประวัติการซื้อได้", error: error.message });
    }
};

module.exports = { 
    previewPrice, 
    executePurchase, 
    getUserPurchaseHistory 
};