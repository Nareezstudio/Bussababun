const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * 1. เส้นทางสำหรับซื้อตอนนิยาย (ใช้ Coins)
 * @route   POST /api/payments/buy
 * @access  Private
 */
router.post('/buy', protect, paymentController.buyChapter);

/**
 * 2. เส้นทางสำหรับเติมเงิน (Pay Solutions V4)
 * @route   POST /api/payments/charge
 * @desc    สร้างรายการเติมเงินและรับ Payment URL
 * @access  Private
 */
router.post('/charge', protect, paymentController.processPaySolutionsCharge);
/**
 * 3. เส้นทางสำหรับดึงประวัติการเติมเงิน
 * @route   GET /api/payments/history
 * @access  Private
 */
router.get('/history', protect, paymentController.getHistory);

/**
 * 4. เส้นทางตรวจสอบสถานะการชำระเงิน (สำหรับหน้า Frontend หลัง Redirect กลับมา)
 * @route   GET /api/payments/status/:refno
 * @access  Private
 */
router.get('/status/:refno', protect, paymentController.checkPaymentStatus);

/**
 * 5. Webhook / Postback (Pay Solutions จะเป็นคนส่งข้อมูลมาหาเรา)
 * @route   POST /api/payments/webhook
 * @desc    รับสถานะการจ่ายเงินเพื่อเพิ่มเหรียญอัตโนมัติ
 * @access  Public (ห้ามใส่ protect)
 */
// หมายเหตุ: Pay Solutions จะส่งข้อมูลมาที่ URL นี้ตามที่เราตั้งไว้ใน posturl
router.post('/webhook', paymentController.paySolutionsWebhook);

module.exports = router;