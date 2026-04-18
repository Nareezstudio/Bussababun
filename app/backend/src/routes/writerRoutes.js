const express = require('express');
const router = express.Router();
const writerController = require('../controllers/writerController');
const { getMyIncome } = require('../controllers/incomeController');
const { protect } = require('../middlewares/authMiddleware');
// routes/writerRoutes.js (ตัวอย่าง)
const upload = require('../config/cloudinary'); // multer-storage-cloudinary ที่คุณมีอยู่แล้ว

router.post('/upload-image', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  // ส่ง URL ของรูปบน Cloudinary กลับไปให้ Frontend
  res.json({ url: req.file.path }); 
});

// GET /api/writer/dashboard
router.get('/dashboard', protect, writerController.getWriterDashboard);
router.get('/income-report', protect, getMyIncome);
router.get('/stats', protect, writerController.getWriterStats);
router.post('/re-verify', protect, writerController.reSubmitVerification);

module.exports = router;