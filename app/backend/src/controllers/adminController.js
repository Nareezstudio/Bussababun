const prisma = require('../lib/prisma');

/**
 * --- HELPER FUNCTION ---
 */
const getSystemShares = async () => {
  const settings = await prisma.systemSetting.findFirst({ where: { id: 1 } });
  return {
    writerPercent: settings?.writerShare || 70,
    systemPercent: settings?.systemShare || 30
  };
};

/**
 * 0. สถิติรวมสำหรับหน้า Home (Public)
 */
const getSystemStats = async (req, res) => {
  try {
    const [novelCount, writerCount, readerCount] = await Promise.all([
      prisma.novel.count(),
      prisma.user.count({ where: { role: 'WRITER' } }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      totalNovels: novelCount,
      totalWriters: writerCount,
      totalReaders: readerCount + 45000, 
      topRanking: "Top 10"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1. แผงควบคุมสถิติ (Admin Dashboard Stats)
 */
const getAdminStats = async (req, res) => {
  try {
    const { writerPercent } = await getSystemShares();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      userCount, novelCount, pendingWriters, pendingWithdrawals,
      allTimeTopup, allTimePurchase,
      monthlyTopup, monthlyPurchase,
      dailyTopup, dailyPurchase
    ] = await Promise.all([
      prisma.user.count(),
      prisma.novel.count(),
      prisma.user.count({ where: { verification: 'PENDING' } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.topUpHistory.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS' } }),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.topUpHistory.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS', createdAt: { gte: startOfMonth } } }),
      prisma.purchase.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.topUpHistory.aggregate({ _sum: { amount: true }, where: { status: 'SUCCESS', createdAt: { gte: startOfDay } } }),
      prisma.purchase.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfDay } } })
    ]);

    const calculateShares = (sumObj) => {
      const total = Number(sumObj._sum.amount) || 0;
      const writer = Math.floor((total * writerPercent) / 100);
      const system = total - writer;
      return { total, writer, system };
    };

    const dailyData = calculateShares(dailyPurchase);
    const monthlyData = calculateShares(monthlyPurchase);
    const allTimeData = calculateShares(allTimePurchase);

    res.status(200).json({
      success: true,
      stats: {
        counts: { userCount, novelCount, pendingWriters, pendingWithdrawals },
        daily: { 
          moneyIn: Number(dailyTopup._sum.amount) || 0, 
          salesCoins: dailyData.total, 
          writerEarnings: dailyData.writer, 
          systemRevenue: dailyData.system 
        },
        monthly: { 
          moneyIn: Number(monthlyTopup._sum.amount) || 0, 
          salesCoins: monthlyData.total, 
          writerEarnings: monthlyData.writer, 
          systemRevenue: monthlyData.system 
        },
        allTime: { 
          totalMoneyIn: Number(allTimeTopup._sum.amount) || 0, 
          totalSalesCoins: allTimeData.total, 
          writerEarnings: allTimeData.writer, 
          systemRevenue: allTimeData.system 
        }
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. จัดการผู้สมัครนักเขียน
 */
const getPendingWriters = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { verification: 'PENDING' },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        realSurname: true,   // ✅ เพิ่มเพื่อให้ VerifyWriters.jsx แสดงผลได้
        penName: true,       // ✅ เพิ่มนามปากกา
        idCardNumber: true,  
        idCardImage: true,
        bankBookImage: true, // ✅ เพิ่มรูปสมุดบัญชี
        bankName: true,
        bankAccount: true,   // ✅ แก้จาก bankAccountNumber เป็น bankAccount ให้ตรง Schema
        bankAccountName: true,
        createdAt: true
      },
      orderBy: { updatedAt: 'asc' }
    });
    res.status(200).json({ success: true, data: pendingUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyWriter = async (req, res) => {
  const { userId, status, reason } = req.body; // status: 'APPROVED' | 'REJECTED'
  try {
    const { writerPercent } = await getSystemShares();
    
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          verification: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
          role: status === 'APPROVED' ? 'WRITER' : 'READER',
          rejectedReason: status === 'REJECTED' ? reason : null
        }
      });

      await tx.notification.create({
        data: {
          userId: userId,
          title: status === 'APPROVED' ? 'ยินดีด้วย! บัญชีนักเขียนได้รับการอนุมัติ' : 'ใบสมัครนักเขียนถูกปฏิเสธ',
          message: status === 'APPROVED' 
            ? `ตอนนี้คุณสามารถลงนิยายและรับส่วนแบ่งรายได้ ${writerPercent}% ได้แล้ว` 
            : `สาเหตุ: ${reason || 'ข้อมูลไม่ครบถ้วน หรือเอกสารไม่ชัดเจน'}`,
          type: 'SYSTEM'
        }
      });
    });

    res.status(200).json({ success: true, message: `ดำเนินการ ${status} เรียบร้อย` });
  } catch (error) {
    console.error("Verify Writer Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
  }
};

/**
 * 3. จัดการนิยาย
 */
const getNovels = async (req, res) => {
  try {
    const novels = await prisma.novel.findMany({
      include: {
        author: { select: { username: true } },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: novels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleRecommend = async (req, res) => {
  try {
    const { id } = req.params; 
    const novel = await prisma.novel.findUnique({ where: { id: id } });

    if (!novel) return res.status(404).json({ success: false, message: "ไม่พบนิยาย" });

    const updated = await prisma.novel.update({
      where: { id: id },
      data: { isRecommended: !novel.isRecommended }
    });

    res.json({ success: true, message: "อัปเดตสถานะแนะนำเรียบร้อย", isRecommended: updated.isRecommended });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. จัดการการเงิน
 */
const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await prisma.withdrawal.findMany({
      include: { 
        user: { 
          select: { 
            username: true, 
            email: true, 
            bankName: true, 
            bankAccount: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveWithdrawal = async (req, res) => {
  const { withdrawalId, slipImage, status, adminNote } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) throw new Error("ไม่พบรายการถอนเงิน");

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status, slipImage, adminNote, updatedAt: new Date() }
      });

      // ถ้าปฏิเสธ ให้คืนเงินเข้ากระเป๋า Earnings ของนักเขียน
      if (status === 'REJECTED') {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { earnings: { increment: withdrawal.amount } }
        });
      }

      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          title: status === 'PAID' ? "การถอนเงินสำเร็จ" : "การถอนเงินถูกปฏิเสธ",
          message: status === 'PAID' 
            ? `เงินจำนวน ${withdrawal.amount} บาท ถูกโอนเข้าบัญชีของคุณแล้ว`
            : `สาเหตุ: ${adminNote}`,
          type: "SYSTEM"
        }
      });
    });
    res.json({ success: true, message: "อัปเดตสถานะการถอนเงินเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. ตั้งค่าระบบและประกาศ
 */
const getSettings = async (req, res) => {
  try {
    let settings = await prisma.systemSetting.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = { 
        siteName: "bussababun.com", 
        writerShare: 70, 
        systemShare: 30 
      };
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  const { siteName, writerShare, systemShare } = req.body;
  try {
    const settings = await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: { 
        siteName, 
        writerShare: Number(writerShare), 
        systemShare: Number(systemShare) 
      },
      create: { 
        id: 1, 
        siteName, 
        writerShare: Number(writerShare), 
        systemShare: Number(systemShare) 
      },
    });
    res.json({ success: true, message: "บันทึกข้อมูลเรียบร้อยแล้ว", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenueChartData = async (req, res) => {
  try {
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [topup, purchase] = await Promise.all([
        prisma.topUpHistory.aggregate({
          _sum: { amount: true },
          where: { status: 'SUCCESS', createdAt: { gte: startOfDay, lte: endOfDay } }
        }),
        prisma.purchase.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: startOfDay, lte: endOfDay } }
        })
      ]);

      chartData.push({
        date: startOfDay.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        income: Number(topup._sum.amount) || 0,
        coins: Number(purchase._sum.amount) || 0
      });
    }
    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Category Management ---
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: "ชื่อหมวดหมู่นี้มีอยู่แล้ว" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "ลบหมวดหมู่เรียบร้อย" });
  } catch (error) {
    res.status(400).json({ success: false, message: "ไม่สามารถลบได้ เนื่องจากมีนิยายใช้หมวดนี้อยู่" });
  }
};

// --- Announcement Management ---
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target } = req.body;
    const announcement = await prisma.announcement.create({
      data: { title, content, target, isActive: true }
    });
    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicAnnouncements = async (req, res) => {
  try {
    const news = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminAnnouncements = async (req, res) => {
  try {
    const data = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ 
      where: { id: parseInt(id) } 
    }); 
    res.json({ success: true, message: "ลบประกาศเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: "ไม่พบประกาศ" });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = {
  getSystemStats,
  getAdminStats,
  getPendingWriters,
  verifyWriter,
  getNovels,
  toggleRecommend,
  getWithdrawalRequests,
  approveWithdrawal,
  getSettings,
  updateSettings,
  getRevenueChartData,
  getCategories,
  createCategory,
  deleteCategory,
  createAnnouncement,
  getPublicAnnouncements,
  getAnnouncementById,
  getAdminAnnouncements,
  deleteAnnouncement
};