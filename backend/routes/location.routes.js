const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/states', locationController.getStates);
router.get('/districts/:stateId', locationController.getDistricts);
router.get('/villages/:districtId', locationController.getVillages);

// Admin only
router.post('/states', protect, authorize('admin'), locationController.addState);
router.post('/districts', protect, authorize('admin'), locationController.addDistrict);
router.post('/villages', protect, authorize('admin'), locationController.addVillage);

module.exports = router;
