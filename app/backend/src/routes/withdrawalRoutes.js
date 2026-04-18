// ตัวอย่าง routes/withdrawalRoutes.js
const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // ต้อง Login ก่อนเท่านั้น

router.post('/send-otp', withdrawalController.sendWithdrawOTP); // กดก่อนเพื่อรับรหัส
router.post('/request', withdrawalController.requestWithdraw);  // ส่งข้อมูลถอน + otp
router.get('/history', withdrawalController.getMyWithdrawHistory);

module.exports = router;