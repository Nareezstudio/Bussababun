const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ตั้งค่าที่เก็บไฟล์สำหรับ "เอกสารนักเขียน" โดยเฉพาะ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'siamfiction/documents', // ชื่อโฟลเดอร์ใน Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // เพิ่มการตั้งชื่อไฟล์สุ่มเพื่อความปลอดภัย
    public_id: (req, file) => `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  },
});

const upload = multer({ storage: storage });

module.exports = upload;