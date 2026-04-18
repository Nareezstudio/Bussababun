const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

/**
 * 📢 1. Public Routes
 */
router.get('/public/announcements', adminController.getPublicAnnouncements);
router.get('/public/announcements/:id', adminController.getAnnouncementById);
router.get('/public/home-stats', adminController.getSystemStats); 
router.get('/public/categories', adminController.getCategories);

/**
 * 🔒 2. Admin Protected Routes
 */
router.use(protect, adminOnly); 

// Dashboard
router.get('/stats', adminController.getAdminStats);
router.get('/chart-revenue', adminController.getRevenueChartData);

// Announcements
router.get('/announcements', adminController.getAdminAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Writer Verification
router.get('/pending-writers', adminController.getPendingWriters);
router.post('/verify-writer', adminController.verifyWriter);

// Novels
router.get('/novels', adminController.getNovels);
router.patch('/novels/:id/recommend', adminController.toggleRecommend);

// Categories
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Financials
router.get('/withdrawals', adminController.getWithdrawalRequests);
router.post('/withdrawals/approve', adminController.approveWithdrawal);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;