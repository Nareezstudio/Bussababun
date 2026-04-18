// backend/src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController'); // ดึงมาถูกตัวแล้ว
const { protect } = require('../middlewares/authMiddleware');

// ✅ แก้ไข: เปลี่ยนจาก novelController เป็น commentController ให้ตรงกับที่ import ไว้ข้างบน
router.get('/chapters/:chapterId/comments', commentController.getCommentsByChapter);

// ✅ แก้ไข: เปลี่ยนเป็น commentController เช่นกัน
router.post('/comments', protect, commentController.addComment);

module.exports = router;