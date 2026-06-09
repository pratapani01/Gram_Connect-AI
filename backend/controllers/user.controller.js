const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { asyncHandler } = require('../middleware/error.middleware');

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, mobile, address } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (mobile) user.mobile = mobile;
  if (address) user.address = address;

  // Handle profile picture upload
  if (req.file) {
    // Delete old image from cloudinary
    if (user.profilePicturePublicId) {
      await cloudinary.uploader.destroy(user.profilePicturePublicId).catch(() => {});
    }
    user.profilePicture = req.file.path;
    user.profilePicturePublicId = req.file.filename;
  }

  await user.save();

  const updated = await User.findById(user._id)
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');

  res.json({ success: true, message: 'Profile updated successfully', user: updated });
});

// Get profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');
  res.json({ success: true, user });
});
