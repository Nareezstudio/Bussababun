const prisma = require('../lib/prisma');

exports.createReview = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: novelId } = req.params; // รับ ID นิยายจาก URL
    const userId = req.user.id; 

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "กรุณากรอกเนื้อหาคอมเมนต์" });
    }

    const newComment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: userId,
        novelId: novelId, // ตอนนี้บันทึกได้แล้วเพราะมีคอลัมน์ใน DB แล้ว
      },
      include: {
        user: { select: { username: true, profileImage: true } }
      }
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Database Error Detail:", err);
    res.status(500).json({ message: "ไม่สามารถบันทึกคอมเมนต์ได้", error: err.message });
  }
};

// ✅ ดึงคอมเมนต์
exports.getReviewsByNovel = async (req, res) => {
  try {
    const { id: novelId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { novelId: novelId },
      include: {
        user: { select: { username: true, profileImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลคอมเมนต์ได้" });
  }
};