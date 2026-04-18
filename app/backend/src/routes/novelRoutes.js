const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const reviewController = require('../controllers/reviewController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

/**
 * -----------------------------------------------------------
 * @section 1. Static & Management Routes
 * (เส้นทางที่เป็นชื่อเฉพาะ ต้องวางไว้ก่อนกลุ่มที่มี :id เสมอ)
 * -----------------------------------------------------------
 */
router.get('/', novelController.getAllNovels); 
router.get('/categories', novelController.getCategories);
router.get('/promoted', novelController.getPromotedNovels);
router.get('/my-novels', protect, novelController.getMyNovels);
router.get('/my-bookshelf', protect, novelController.getMyFollowedNovels); // ✅ ย้ายมาไว้ที่นี่
router.get('/category/:id', novelController.getNovelsByCategory); // 👈 ต้องมีบรรทัดนี้!

// สร้างนิยายใหม่
router.post('/', protect, upload.single('coverImage'), novelController.createNovel);

// ค้นหานิยาย (Public)
router.get('/search', novelController.searchNovels);

/**
 * -----------------------------------------------------------
 * @section 2. Chapter Actions (Specific)
 * -----------------------------------------------------------
 */
// การซื้อตอน
router.post('/chapters/purchase', protect, novelController.purchaseChapter); 

// จัดการตอนรายบุคคล (ใช้ :chapterId)
router.get('/chapters/:chapterId', optionalProtect, novelController.getChapterDetail);
router.get('/chapters/:chapterId/edit', protect, novelController.getChapterForEdit);
router.put('/chapters/:chapterId', protect, novelController.updateChapter);
router.delete('/chapters/:chapterId', protect, novelController.deleteChapter);

/**
 * -----------------------------------------------------------
 * @section 3. Novel Dynamic Routes (/:id)
 * (เส้นทางที่ขึ้นต้นด้วย ID นิยาย ต้องวางไว้ท้ายสุด)
 * -----------------------------------------------------------
 */

// 1. ระบบรีวิวและติดตาม (วางไว้ก่อน getNovelById เพื่อความชัดเจน)
router.get('/:id/reviews', reviewController.getReviewsByNovel);
router.post('/:id/reviews', protect, reviewController.createReview); 
router.post('/:id/follow', protect, novelController.toggleFollow); // ✅ ปุ่มหัวใจ
router.patch('/:id/recommend', protect, novelController.toggleRecommended);

// 2. การจัดการตอนภายในนิยายเรื่องนั้นๆ
router.get('/:id/chapters', novelController.getChaptersByNovel);
router.post('/:id/chapters', protect, novelController.addChapter);
router.put('/:id', protect, novelController.updateNovel);

// 3. การดึงข้อมูลพื้นฐาน (ดึงทั้งหมด / ดึงรายเรื่อง)
router.get('/:id', optionalProtect, novelController.getNovelById);

module.exports = router;