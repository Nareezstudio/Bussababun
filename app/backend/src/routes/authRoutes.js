// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); 
const upload = require('../config/cloudinary');

// --- Authentication ---
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// --- Writer Application ---
// ✅ ปรับชื่อ name ให้ตรงกับที่ Frontend .append เข้ามา
router.post('/become-writer', 
  protect, 
  upload.fields([
    { name: 'idCardImage', maxCount: 1 },
    { name: 'bankBookImage', maxCount: 1 }
  ]), 
  authController.becomeWriter
);

module.exports = router;