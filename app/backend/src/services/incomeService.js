// src/services/incomeService.js
const prisma = require('../lib/prisma');

const getWriterIncomeReport = async (writerId) => {
  // 1. ดึงข้อมูลสรุปจากตาราง User (ยอดที่ถอนได้ปัจจุบัน)
  const writer = await prisma.user.findUnique({
    where: { id: writerId },
    select: { income: true, earnings: true }
  });

  if (!writer) {
    throw new Error("ไม่พบข้อมูลนักเขียน");
  }
  
  // 2. ดึงรายการธุรกรรมล่าสุด (Transactions)
  const transactions = await prisma.transaction.findMany({
    where: { writerId: writerId },
    include: {
      chapter: {
        select: { title: true, novel: { select: { title: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // ดึง 50 รายการล่าสุด
  });

  // 3. คำนวณยอดขายแยกตามรายเรื่อง (Group by Novel)
  const salesByNovel = await prisma.purchase.groupBy({
    by: ['chapterId'],
    where: {
      chapter: { novel: { authorId: writerId } }
    },
    _sum: {
      writerShare: true,
      amount: true
    },
    _count: {
      id: true
    }
  });

  return {
    summary: {
      totalBalance: writer.income, // รายได้สะสมทั้งหมด
      withdrawable: writer.earnings, // ยอดที่ถอนได้จริงตอนนี้
    },
    recentTransactions: transactions.map(t => ({
      date: t.createdAt,
      novel: t.chapter.novel.title,
      chapter: t.chapter.title,
      totalAmount: t.totalAmount, // ราคาที่คนอ่านจ่าย (หลังหักส่วนลด)
      writerRevenue: t.writerRevenue, // 70% ที่นักเขียนได้รับ
      systemFee: t.systemFee // 30% ที่ระบบหัก
    }))
  };
};

module.exports = { getWriterIncomeReport };