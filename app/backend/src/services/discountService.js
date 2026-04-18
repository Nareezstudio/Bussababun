// เปลี่ยนจาก import เป็น require ให้สอดคล้องกับไฟล์อื่นๆ
const prisma = require('../lib/prisma');

/**
 * ฟังก์ชันคำนวณราคาพร้อมส่วนลดจากโปรโมชั่นและคูปอง
 */
const calculatePrice = async (userId, chapterId, couponCode = null) => {
  const now = new Date();

  // 1. ดึงข้อมูล Chapter พร้อมเช็ค N-to-N Relationship กับ Promotion
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      novel: {
        include: {
          promotions: {
            where: {
              isActive: true,
              startDate: { lte: now },
              endDate: { gte: now }
            },
            include: { chapters: { select: { id: true } } }
          }
        }
      }
    }
  });

  if (!chapter) throw new Error("ไม่พบตอนนิยาย");

  let basePrice = chapter.price;
  let discountedPrice = basePrice;
  let promotionInfo = null;

  // 2. คำนวณส่วนลดจาก Promotion
  // เช็คว่ามีโปรโมชั่นที่คลุมทั้งเรื่อง หรือระบุเฉพาะตอน (N-to-N) หรือไม่
  const activePromo = chapter.novel.promotions.find(p => 
    p.scope === 'ON_NOVEL' || 
    (p.scope === 'ON_CHAPTER' && p.chapters.some(c => c.id === chapterId))
  );

  if (activePromo) {
    promotionInfo = activePromo.name;
    if (activePromo.discountType === 'PERCENT') {
      discountedPrice = basePrice - (basePrice * activePromo.discountValue / 100);
    } else if (activePromo.discountType === 'COIN') { 
      discountedPrice = basePrice - activePromo.discountValue;
    }
    discountedPrice = Math.max(0, discountedPrice);
  }

  // 3. คำนวณส่วนลดจาก Coupon (ลดเพิ่มจากราคาที่ลดโปรโมชั่นแล้ว)
  let couponInfo = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    // เงื่อนไข: มีคูปอง, ยอดซื้อขั้นต่ำผ่าน, และยังไม่เต็มโควตา
    if (coupon && discountedPrice >= (coupon.minPurchase || 0)) {
      if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
        let couponDiscount = 0;
        if (coupon.discountType === 'PERCENT') {
          couponDiscount = discountedPrice * (coupon.discountValue / 100);
        } else {
          couponDiscount = coupon.discountValue;
        }
        discountedPrice = Math.max(0, discountedPrice - couponDiscount);
        couponInfo = coupon.code;
      }
    }
  }

  const finalPrice = Math.floor(discountedPrice);

  // 4. คืนค่าผลลัพธ์
  return {
    originalPrice: basePrice,
    finalPrice: finalPrice,
    totalDiscount: basePrice - finalPrice,
    promotionApplied: promotionInfo,
    couponApplied: couponInfo
  };
};

// ส่งออกฟังก์ชันด้วยรูปแบบ CommonJS
module.exports = {
  calculatePrice
};