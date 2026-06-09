const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/sarpanch-requests', adminController.getSarpanchRequests);
router.post('/create-sarpanch', adminController.createSarpanch);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/complaints', adminController.getAllComplaints);
router.get('/analytics/states', adminController.getStateAnalytics);
router.get('/analytics/growth', adminController.getGrowthChart);

module.exports = router;
