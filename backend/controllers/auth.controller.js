const User = require('../models/User');
const { State, District, Village } = require('../models/Location');
const SarpanchRequest = require('../models/SarpanchRequest');
const Complaint = require('../models/Complaint');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { asyncHandler } = require('../middleware/error.middleware');
const { notifyAdminSarpanchRequest } = require('../utils/notification');

// Register Citizen
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, state, district, village, address } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

  // Validate location
  const stateDoc = await State.findById(state);
  const districtDoc = await District.findById(district);
  const villageDoc = await Village.findById(village);
  if (!stateDoc || !districtDoc || !villageDoc) {
    return res.status(400).json({ success: false, message: 'Invalid location selected' });
  }

  const user = await User.create({ name, email, password, mobile, role: 'citizen', state, district, village, address });

  // Handle sarpanch request tracking
  let sarpanchRequest = await SarpanchRequest.findOne({ village });
  if (!sarpanchRequest) {
    sarpanchRequest = await SarpanchRequest.create({
      village,
      district,
      state,
      citizenCount: 1,
      complaintCount: 0,
    });
    // Notify admins
    const admins = await User.find({ role: 'admin' });
    if (!villageDoc.hasSarpanch) {
      for (const admin of admins) {
        await notifyAdminSarpanchRequest(admin._id, villageDoc, districtDoc, stateDoc);
      }
    }
  } else {
    sarpanchRequest.citizenCount += 1;
    await sarpanchRequest.save();
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);
  user.refreshTokens.push({ token: refreshToken });
  user.lastLogin = new Date();
  await user.save();

  const populated = await User.findById(user._id)
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    accessToken,
    refreshToken,
    user: populated,
  });
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password')
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');

  if (!user || !await user.comparePassword(password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Prune old refresh tokens (keep last 5)
  user.refreshTokens = user.refreshTokens.slice(-4);
  user.refreshTokens.push({ token: refreshToken });
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    accessToken,
    refreshToken,
    user,
  });
});

// Refresh Token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id)
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
  if (!tokenExists) {
    return res.status(401).json({ success: false, message: 'Refresh token revoked' });
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id, user.role);

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
  user.refreshTokens.push({ token: newRefreshToken });
  await user.save();

  res.json({
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user,
  });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken && req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken);
    await req.user.save();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('state', 'name')
    .populate('district', 'name')
    .populate('village', 'name hasSarpanch');
  res.json({ success: true, user });
});

// Change password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!await user.comparePassword(currentPassword)) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  user.forcePasswordChange = false;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});
