const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');

// เปลี่ยนบรรทัดนี้: ดึงฟังก์ชัน protect มาใช้งาน
const { protect } = require('../middlewares/authMiddleware'); 

// บรรทัดที่ 10 ที่เคย Error แก้เป็นแบบนี้ครับ:
router.get('/my-income', protect, incomeController.getMyIncome);

module.exports = router;