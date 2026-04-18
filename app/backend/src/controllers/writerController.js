// backend/src/controllers/writerController.js
const prisma = require('../lib/prisma');
//const { startOfDay, subDays } = require('date-fns'); // แนะนำให้ลง npm install date-fns

exports.getWriterStats = async (req, res) => {
  try {
    const writerId = req.user.id; // ดึง ID จาก Middleware Protect
    //const sevenDaysAgo = subDays(new Date(), 7);

    // ใช้คำสั่ง JS พื้นฐานหาวันที่ย้อนหลัง 7 วัน
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. ดึงรายได้รวมและแยกตามวัน (ย้อนหลัง 7 วัน)
    // หมายเหตุ: ใน Prisma การ Group By วันที่ตรงๆ อาจจะซับซ้อน 
    // แนะนำให้ดึง Raw Data ของช่วง 7 วันมาประมวลผลหรือใช้ queryRaw
    const transactions = await prisma.purchase.findMany({
      where: {
        chapter: {
          novel: {
            authorId: writerId
          }
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // 2. ประมวลผลข้อมูลจัดกลุ่มตามวันที่ (Helper Logic)
    const stats = transactions.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0]; // ดึงแค่ YYYY-MM-DD
      const writerRevenue = Math.floor(curr.amount * 0.7); // ส่วนแบ่ง 70%
      
      if (!acc[date]) {
        acc[date] = { date, revenue: 0 };
      }
      acc[date].revenue += writerRevenue;
      return acc;
    }, {});

    // 3. ดึงข้อมูลสรุปภาพรวม (Total Earnings & Total Coins)
    const user = await prisma.user.findUnique({
      where: { id: writerId },
      select: { earnings: true, coins: true }
    });

    res.json({
      dailyStats: Object.values(stats), // ส่งออกเป็น Array เพื่อทำกราฟ
      totalEarnings: user.earnings,
      currentCoins: user.coins
    });

  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลสถิติได้" });
  }
};

exports.getWriterDashboard = async (req, res) => {
  const authorId = req.user.id; // ดึง ID นักเขียนจาก Token

  try {
    // 1. สรุปภาพรวม: รายได้ทั้งหมด และ จำนวนครั้งที่มีคนซื้อ
    const summary = await prisma.purchase.aggregate({
      where: {
        chapter: {
          novel: { authorId: authorId }
        }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    // 2. รายละเอียดแยกรายนิยาย
    const novels = await prisma.novel.findMany({
      where: { authorId },
      include: {
        chapters: {
          include: {
            _count: { select: { purchases: true } },
            purchases: { select: { amount: true } }
          }
        }
      }
    });

    // 3. จัด Format ข้อมูลให้นำไปใช้ง่ายๆ
    const report = novels.map(novel => {
      const totalIncome = novel.chapters.reduce((sum, ch) => {
        return sum + ch.purchases.reduce((pSum, p) => pSum + p.amount, 0);
      }, 0);

      return {
        id: novel.id,
        title: novel.title,
        totalSales: novel.chapters.reduce((sum, ch) => sum + ch._count.purchases, 0),
        income: totalIncome
      };
    });

    res.json({
      totalEarnings: summary._sum.amount || 0,
      totalOrders: summary._count.id,
      novelDetails: report
    });

  } catch (error) {
    res.status(500).json({ message: "Dashboard Error", error: error.message });
  }
};



exports.reSubmitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      realName, 
      penName,        // เพิ่มการรับค่า penName
      idCardNumber, 
      bankAccount, 
      bankName, 
      idCardImage 
    } = req.body;

    // 1. Validation
    if (!realName || !penName || !idCardNumber || !bankAccount || !bankName || !idCardImage) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // 2. Check User Status
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    
    if (currentUser.verification === 'PENDING') {
      return res.status(400).json({ message: "อยู่ระหว่างตรวจสอบ ไม่สามารถส่งซ้ำได้" });
    }

    // 3. Unique Check (ID Card)
    const existingIdCard = await prisma.user.findFirst({
      where: { idCardNumber, NOT: { id: userId } }
    });
    if (existingIdCard) return res.status(400).json({ message: "เลขบัตรนี้ถูกใช้ไปแล้ว" });

    // 4. Update Data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        realName,
        penName,      // อัปเดตนามปากกาลง DB
        idCardNumber,
        bankAccount,
        bankName,
        idCardImage,
        verification: 'PENDING',
        rejectedReason: null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        penName: true,
        verification: true
      }
    });

    res.json({ success: true, message: "ส่งข้อมูลเรียบร้อยแล้ว", user: updatedUser });
  } catch (error) {
    console.error("Re-submit error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};