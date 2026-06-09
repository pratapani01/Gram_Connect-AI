const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadComplaintImages } = require('../config/cloudinary');
const { complaintValidation, validate } = require('../middleware/validation.middleware');

router.use(protect);

router.post('/', uploadComplaintImages.array('images', 5), complaintValidation, validate, complaintController.createComplaint);
router.get('/', complaintController.getComplaints);
router.get('/stats', complaintController.getStats);
router.get('/monthly-trend', complaintController.getMonthlyTrend);
router.get('/:id', complaintController.getComplaint);
router.patch('/:id/status', authorize('sarpanch', 'admin'), uploadComplaintImages.array('resolutionImages', 5), complaintController.updateComplaintStatus);

module.exports = router;
