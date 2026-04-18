// src/routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/purchases/preview
 * @desc    เช็คราคาก่อนซื้อ (คำนวณส่วนลด/โปรโมชั่น)
 */
router.post('/preview-price', protect, purchaseController.previewPrice);

/**
 * @route   POST /api/purchases/confirm
 * @desc    ยืนยันการซื้อตอนนิยาย (หักเงิน/เพิ่มรายได้นักเขียน)
 */
router.post('/purchase', protect, purchaseController.executePurchase);

/**
 * @route   GET /api/purchases/my-history
 * @desc    ดูประวัติการซื้อนิยายของตัวเอง
 */
router.get('/my-history', protect, purchaseController.getUserPurchaseHistory);

module.exports = router;