const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', contestController.getContests);
router.post('/submit', protect, contestController.submitEntry);

module.exports = router;