const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ดึงข้อมูลที่จำเป็น
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { 
          id: true, 
          role: true, 
          coins: true,
          verification: true, // สำหรับเช็คสถานะนักเขียน
          email: true,
          // isActive: true // สมมติว่ามีฟิลด์นี้ใน Schema เพื่อเช็คการโดนแบน
        }
      });

      if (!user) {
        return res.status(401).json({ message: "ไม่พบผู้ใช้งานในระบบ" });
      }

      // ตรวจสอบว่า ID ใน Token ยังตรงกับใน DB หรือไม่ (กรณีมีการเปลี่ยนรหัสผ่าน/ลบบัญชี)
      req.user = user;
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: "Token Missing: กรุณาเข้าสู่ระบบ" });
    }
  } catch (error) {
    console.error("Protect Error:", error.message);
    const message = error.name === 'TokenExpiredError' ? "Token หมดอายุแล้ว" : "Token ไม่ถูกต้อง";
    return res.status(401).json({ message });
  }
};

const optionalProtect = async (req, res, next) => {
  // ทำหน้าที่เหมือนเดิม แต่ช่วยให้ระบบไม่พังถ้า Token ผิด
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, coins: true } 
      });
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

const adminOnly = (req, res, next) => {
  // เช็ค Role จาก req.user ที่ได้มาจาก protect/optionalProtect
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: "ปฏิเสธการเข้าถึง: สำหรับผู้ดูแลระบบเท่านั้น" });
  }
};

module.exports = { protect, optionalProtect, adminOnly };