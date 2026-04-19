const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', contestController.getContests);
router.post('/submit', protect, contestController.submitEntry);

module.exports = router;