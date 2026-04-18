const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect } = require('../middlewares/authMiddleware');

// สำหรับนักเขียน
router.post('/create', protect, promotionController.createPromotion);
router.get('/my-promotions', protect, promotionController.getMyPromotions);
router.get('/report/:promotionId', protect, promotionController.getPromotionReport);

// สำหรับนักอ่าน/ระบบซื้อขาย
router.post('/check-coupon', protect, promotionController.checkCoupon);
router.post('/calculate-price', protect, promotionController.calculatePrice); 

module.exports = router;