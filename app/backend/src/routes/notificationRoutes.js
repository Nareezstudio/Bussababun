const express = require('express');
const router = express.Router();
// ✅ เรียกใช้ prisma จากไฟล์กลางเพื่อป้องกันการสร้าง Connection ซ้ำจน Server ล่ม
const prisma = require('../lib/prisma'); 
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/notifications
 * @desc    ดึงข้อมูลการแจ้งเตือนทั้งหมดของผู้ใช้ (เรียงจากใหม่ไปเก่า)
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { 
        userId: req.user.id 
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      // จำกัดการดึงข้อมูล 20 รายการล่าสุดเพื่อประสิทธิภาพของระบบ
      take: 20 
    });
    res.json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" });
  }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    อัปเดตสถานะแจ้งเตือนทั้งหมดเป็น "อ่านแล้ว"
 */
router.patch('/read-all', protect, async (req, res) => {
  try {
    const updateResult = await prisma.notification.updateMany({
      where: { 
        userId: req.user.id,
        isRead: false 
      },
      data: { 
        isRead: true 
      },
    });
    
    res.json({ 
      message: "อ่านแจ้งเตือนทั้งหมดแล้ว",
      count: updateResult.count 
    });
  } catch (error) {
    console.error("Update Notifications Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    ลบการแจ้งเตือนบางรายการ
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่าแจ้งเตือนนี้เป็นของผู้ใช้ที่ล็อกอินอยู่จริงหรือไม่
    const notification = await prisma.notification.findUnique({
      where: { id: id }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ลบรายการนี้" });
    }

    await prisma.notification.delete({
      where: { id: id }
    });

    res.json({ message: "ลบการแจ้งเตือนเรียบร้อยแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "ไม่สามารถลบการแจ้งเตือนได้" });
  }
});

module.exports = router;