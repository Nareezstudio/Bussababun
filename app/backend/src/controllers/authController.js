const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 1. สมัครสมาชิก
exports.register = async (req, res) => {
  try {
    const { username, email, password, penName } = req.body;
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (userExists) return res.status(400).json({ message: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        penName: penName || username,
        role: 'READER'
      }
    });

    res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. เข้าสู่ระบบ
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. getMe (สำหรับเช็ค Auth หน้าบ้าน)
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        penName: true,        // ดึงนามปากกา
        realName: true,       // ดึงชื่อจริง
        idCardNumber: true,   // ดึงเลขบัตร
        bankAccount: true,    // ดึงเลขบัญชี
        bankName: true,       // ดึงชื่อธนาคาร
        idCardImage: true,    // ดึง URL รูปบัตร
        verification: true,
        profileImage: true,
        coins: true
      }
    });

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- 5. สมัครเป็นนักเขียน (สมบูรณ์) ---
exports.becomeWriter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. รับข้อมูลตัวอักษรจาก req.body
    const { 
      realName, 
      realSurname, 
      penName, 
      idCardNumber, 
      bankName, 
      bankAccount, 
      bankAccountName 
    } = req.body;

    // 2. ดึง URL ของรูปภาพที่อัปโหลดขึ้น Cloudinary ผ่าน Middleware
    const idCardImageUrl = req.files['idCardImage'] ? req.files['idCardImage'][0].path : null;
    const bankBookImageUrl = req.files['bankBookImage'] ? req.files['bankBookImage'][0].path : null;

    // 3. Validation
    if (!realName || !realSurname || !penName || !idCardNumber || !bankAccount || !idCardImageUrl || !bankBookImageUrl) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลและอัปโหลดหลักฐานให้ครบถ้วน" });
    }

    // 4. ตรวจสอบสถานะผู้ใช้
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { verification: true, role: true }
    });

    if (currentUser.verification === 'PENDING') {
      return res.status(400).json({ message: "คุณได้ส่งเอกสารไปแล้ว โปรดรอการตรวจสอบ" });
    }
    if (currentUser.role === 'WRITER' || currentUser.verification === 'VERIFIED') {
      return res.status(400).json({ message: "คุณเป็นนักเขียนอยู่แล้ว" });
    }

    // 5. Transaction: อัปเดต User และสร้าง Notification
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          realName,
          realSurname,
          penName,
          idCardNumber,
          bankName,
          bankAccount,
          bankAccountName,
          idCardImage: idCardImageUrl,     // เก็บ URL จาก Cloudinary
          bankBookImage: bankBookImageUrl, // เก็บ URL จาก Cloudinary
          verification: 'PENDING'
        },
      });

      await tx.notification.create({
        data: {
          userId: userId,
          title: "ส่งเอกสารการสมัครนักเขียนแล้ว",
          message: `ระบบได้รับข้อมูลนามปากกา '${penName}' ของคุณแล้ว เจ้าหน้าที่จะตรวจสอบภายใน 1-3 วัน`,
          type: "SYSTEM"
        }
      });

      return updatedUser;
    });

    res.status(200).json({
      success: true,
      message: "อัปโหลดข้อมูลเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่",
      user: {
        penName: result.penName,
        verification: result.verification
      }
    });

  } catch (error) {
    console.error("Become Writer Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัคร", error: error.message });
  }
};

// 1. ส่งคำขอรีเซ็ต (สร้าง Token)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // สร้าง Token แบบสุ่ม
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // ตั้งเวลาหมดอายุ (เช่น 1 ชั่วโมงจากนี้)
    const tokenExpiry = new Date(Date.now() + 3600000);

    // บันทึกลงฐานข้อมูล
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiry
      }
    });

    // --- ส่วนการส่งอีเมล ---
    // ในที่นี้สมมติว่าส่งลิงก์ไปหา User
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    console.log("Reset URL:", resetUrl); // สำหรับทดสอบใน Console แทนการส่งเมลจริง

    res.status(200).json({ 
      message: "สร้างลิงก์รีเซ็ตรหัสผ่านสำเร็จ (โปรดตรวจสอบใน Console หรือ Email)" 
    });

  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในระบบ" });
  }
};

// 2. ตั้งรหัสผ่านใหม่ (ใช้ Token มายืนยัน)
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // หา User ที่มี Token ตรงกันและยังไม่หมดอายุ
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } // ต้องยังไม่ถึงเวลาหมดอายุ
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10);

    // อัปเดตรหัสผ่านใหม่และล้างค่า Token ทิ้ง
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json({ message: "เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว" });

  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่" });
  }
};

