const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { protect } = require('../middlewares/authMiddleware'); 
const { optionalAuth } = require('../middlewares/optionalAuth');

/**
 * 💡 ลำดับของ Route มีผลมาก (Priority)
 * เราจะวาง Route ที่เป็น "Specific Path" (เส้นทางเฉพาะ) ไว้ข้างบน 
 * และวาง "Dynamic Path" (ที่มี :id) ไว้ข้างล่างสุด
 */

// 🛒 1. การซื้อตอนนิยาย (ต้อง Login)
// POST /api/chapters/purchase
router.post('/purchase', protect, chapterController.purchaseChapter);

// ✍️ 2. การจัดการตอนนิยาย (สำหรับนักเขียน - ต้อง Login)
// POST /api/chapters (สร้างตอนใหม่)
router.post('/', protect, chapterController.createChapter);

// GET /api/chapters/edit/:chapterId (ดึงข้อมูลไปแสดงในหน้าแก้ไข)
router.get('/edit/:chapterId', protect, chapterController.getChapterForEdit);

// PUT /api/chapters/:chapterId (บันทึกการแก้ไข)
router.put('/:chapterId', protect, chapterController.updateChapter);

// DELETE /api/chapters/:chapterId (ลบตอนนิยาย)
router.delete('/:chapterId', protect, chapterController.deleteChapter);

// 📖 3. การดึงรายละเอียดตอนเพื่ออ่าน (สำหรับนักอ่าน)
// GET /api/chapters/:id (ใช้ optionalAuth เพื่อเช็คว่า Login หรือไม่ ถ้า Login จะเช็คสิทธิ์การซื้อได้)
// วางไว้ล่างสุดเพื่อให้ Path อื่นๆ (เช่น /purchase หรือ /edit) ทำงานได้ก่อน
router.patch('/reorder/:novelId', protect, chapterController.reorderChapters);
router.get('/:id', optionalAuth, chapterController.getChapterDetail);

module.exports = router;