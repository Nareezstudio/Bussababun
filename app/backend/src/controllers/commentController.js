const prisma = require('../lib/prisma');

// ✅ 1. เพิ่มคอมเมนต์ใหม่
exports.addComment = async (req, res) => {
  try {
    const { chapterId, content } = req.body;
    const userId = req.user.id; // มาจาก Middleware protect

    if (!content) return res.status(400).json({ message: "กรุณาพิมพ์ข้อความ" });

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        chapterId,
      },
      include: {
        user: { select: { username: true } } // ดึงชื่อคนคอมเมนต์มาด้วย
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "คอมเมนต์ล้มเหลว" });
  }
};

// ✅ 2. ดึงคอมเมนต์ของตอนนั้นๆ
exports.getCommentsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { chapterId },
      include: {
        user: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' } // เอาคอมเมนต์ใหม่ขึ้นก่อน
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "ดึงคอมเมนต์ล้มเหลว" });
  }
};