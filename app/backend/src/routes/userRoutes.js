const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const incomeController = require('../controllers/incomeController');
const { protect } = require('../middlewares/authMiddleware');

// Path จริงๆ จะกลายเป็น /api/user/profile
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/my-income', protect, incomeController.getMyIncome);

// ประวัติการอ่าน (Reading History)
router.post('/reading-history', protect, userController.updateReadingHistory);
router.get('/reading-history', protect, userController.getReadingHistory);

module.exports = router;