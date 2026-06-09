const express = require('express');
const router = express.Router();
const sarpanchController = require('../controllers/sarpanch.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('sarpanch'));

router.get('/village-stats', sarpanchController.getVillageStats);
router.get('/category-stats', sarpanchController.getCategoryStats);
router.get('/monthly-trend', sarpanchController.getMonthlyTrend);
router.get('/citizens', sarpanchController.getVillageCitizens);

module.exports = router;
