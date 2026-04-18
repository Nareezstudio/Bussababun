exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10 // ดึง 10 รายการล่าสุด
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "ดึงข้อมูลล้มเหลว" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: "อ่านทั้งหมดแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "ผิดพลาด" });
  }
};