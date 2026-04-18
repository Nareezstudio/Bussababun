const prisma = require('../lib/prisma');

// 1. ดึงข้อมูลโปรไฟล์แบบละเอียด (รวมประวัติซื้อ)
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, username: true, email: true, coins: true, earnings: true, profileImage: true, role: true, penName: true,
        purchases: {
          include: {
            chapter: { select: { title: true, novel: { select: { title: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "ดึงข้อมูลโปรไฟล์ไม่สำเร็จ" });
  }
};

// 2. หน้าแก้ไขข้อมูลส่วนตัว (Profile Settings)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, penName, profileImage } = req.body;

    // ตรวจสอบว่า username ซ้ำกับคนอื่นไหม (ถ้ามีการเปลี่ยนชื่อ)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      });
      if (existingUser) return res.status(400).json({ message: "ชื่อผู้ใช้นี้มีคนใช้แล้ว" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username,
        penName: penName,
        profileImage: profileImage, // URL รูปที่ได้จาก Cloudinary/Supabase
      },
      select: { // คืนค่าเฉพาะที่จำเป็น
        id: true,
        username: true,
        penName: true,
        profileImage: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({
      success: true,
      message: "อัปเดตโปรไฟล์เรียบร้อยแล้ว",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
};

// ✅ บันทึกหรืออัปเดตประวัติการอ่าน
// backend/src/controllers/userController.js

exports.updateReadingHistory = async (req, res) => {
  const userId = req.user.id;
  // ✅ ตรวจสอบค่าที่ส่งมาจาก body ให้ชัวร์
  const { novelId, chapterId } = req.body;

  // 🛡️ ป้องกัน Error ถ้าค่าที่ส่งมาไม่สมบูรณ์
  if (!novelId || !chapterId) {
    return res.status(400).json({ message: "novelId หรือ chapterId หายไป" });
  }

  try {
    const history = await prisma.readingHistory.upsert({
      where: {
        // ✅ ใช้ชื่อ Unique Index ให้ตรงกับ Schema (มักจะเป็น userId_novelId)
        userId_novelId: {
          userId: userId,
          novelId: String(novelId), // ❗ บังคับเป็น String ป้องกัน Error 'Expected String, provided Int'
        },
      },
      update: {
        chapterId: String(chapterId), // ❗ บังคับเป็น String ป้องกัน NaN
        updatedAt: new Date(),
      },
      create: {
        // ✅ ใช้โครงสร้างแบบ connect เพื่อความปลอดภัยสูงสุดใน Prisma 7
        user: { connect: { id: userId } },
        novel: { connect: { id: String(novelId) } },
        chapter: { connect: { id: String(chapterId) } },
      },
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("❌ Prisma Error:", error.message);
    res.status(500).json({ message: "บันทึกประวัติล้มเหลว", error: error.message });
  }
};

// ✅ ดึงประวัติการอ่าน 5 เรื่องล่าสุด (เอาไปโชว์หน้า Home)
exports.getReadingHistory = async (req, res) => {
  try {
    const history = await prisma.readingHistory.findMany({
      where: { userId: req.user.id },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            author: { select: { username: true } }
          }
        },
        chapter: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    });

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

