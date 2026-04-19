const express = require('express');
const cors = require('cors'); // ตรวจสอบว่ามี import cors แล้ว
const app = express();

// 1. กำหนดลิสต์ URL ที่แน่นอน (Production & Local)
const allowedOrigins = [
  'http://bussababun.com',
  'https://bussababun.com',
  'http://www.bussababun.com',
  'https://www.bussababun.com',
  'http://147.50.255.171',
  'https://147.50.255.171',
  'https://www.paysolutions.asia', // โดเมนของ PaySolution
  'https://paysolutions.asia'
];

// 2. ตั้งค่า CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    // ตรวจสอบเงื่อนไข:
    // - !origin: ยอมรับถ้าเรียกจาก Server-to-Server หรือ Postman
    // - allowedOrigins.indexOf(origin) !== -1: ยอมรับถ้า URL ตรงกับในลิสต์
    // - origin.endsWith('.vercel.app'): ✅ ยอมรับทุก URL ที่มาจาก Vercel (ป้องกันปัญหาตอน Deploy Preview)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // อนุญาตให้ส่ง Cookie และ Authorization Header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 3. ใช้งาน Middleware (ต้องวางไว้ก่อนการนิยาม Route ต่างๆ)
app.use(cors(corsOptions));

const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// --- Middlewares อื่นๆ ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev')); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // สำหรับรับข้อมูลจาก Pay Solutions Webhook

// --- 1. Import Routes ---
const authRoutes = require('./routes/authRoutes');
const novelRoutes = require('./routes/novelRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const writerRoutes = require('./routes/writerRoutes');
const commentRoutes = require('./routes/commentRoutes'); // นำมาประกาศรวมกันด้านบนให้หมด
const promotionRoutes = require('./routes/promotionRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const incomeRoutes = require('./routes/incomeRoutes');

// --- 2. Middlewares ---
// ปรับ helmet เล็กน้อยเพื่อให้โหลดรูปจาก Domain อื่น (เช่น Cloudinary) ได้ปกติ
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

app.use(morgan('dev')); 
app.use(express.json()); 

// ✅ เพิ่มบรรทัดนี้: เพื่อให้ Frontend เข้าถึงรูปภาพในโฟลเดอร์ uploads ได้
// เช่นเรียก http://localhost:5000/uploads/image.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- 3. Routes (ลงทะเบียนเส้นทาง API) ---

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/writer', writerRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/comments', commentRoutes); // ใช้ตัวแปรที่ import ไว้ด้านบน
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/income', incomeRoutes);

// --- 4. Test Route ---
app.get('/test', (req, res) => {
    res.json({ message: "SiamFiction System is online!", timestamp: new Date() });
});

// --- 5. Error Handling & 404 ---
// 404 Handler
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ 
        message: "ไม่พบเส้นทางที่เรียก (Route not found)",
        path: req.url,
        method: req.method
    });
});

// Global Error Handler (ดักจับ Error ที่หลุดออกมาจาก Controller)
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.stack);
    res.status(500).json({ 
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

module.exports = app;