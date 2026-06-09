const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadProfileImage } = require('../config/cloudinary');

router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', uploadProfileImage.single('profilePicture'), userController.updateProfile);

module.exports = router;
