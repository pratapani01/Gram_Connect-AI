const User = require('../models/User');
const Complaint = require('../models/Complaint');
const SarpanchRequest = require('../models/SarpanchRequest');
const { State, District, Village } = require('../models/Location');
const { asyncHandler } = require('../middleware/error.middleware');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

// Dashboard analytics
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStates,
    totalDistricts,
    totalVillages,
    totalCitizens,
    totalSarpanches,
    totalComplaints,
    pendingRequests,
    complaintStats,
  ] = await Promise.all([
    State.countDocuments(),
    District.countDocuments(),
    Village.countDocuments(),
    User.countDocuments({ role: 'citizen' }),
    User.countDocuments({ role: 'sarpanch' }),
    Complaint.countDocuments(),
    SarpanchRequest.countDocuments({ status: 'pending' }),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const statusMap = {};
  complaintStats.forEach(s => statusMap[s._id] = s.count);

  res.json({
    success: true,
    stats: {
      totalStates, totalDistricts, totalVillages,
      totalCitizens, totalSarpanches, totalComplaints,
      pendingRequests,
      complaintsByStatus: statusMap,
    },
  });
});

// Get all pending sarpanch requests
exports.getSarpanchRequests = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [requests, total] = await Promise.all([
    SarpanchRequest.find({ status })
      .populate('village', 'name')
      .populate('district', 'name')
      .populate('state', 'name')
      .populate('sarpanchCreated', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    SarpanchRequest.countDocuments({ status }),
  ]);

  res.json({ success: true, requests, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
});

// Create sarpanch for a village
exports.createSarpanch = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, villageId } = req.body;

  const village = await Village.findById(villageId).populate('district state');
  if (!village) return res.status(404).json({ success: false, message: 'Village not found' });

  if (village.hasSarpanch) {
    return res.status(400).json({ success: false, message: 'This village already has a Sarpanch' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

  const sarpanch = await User.create({
    name, email, password: password || 'Sarpanch@123',
    mobile, role: 'sarpanch',
    state: village.state._id,
    district: village.district._id,
    village: village._id,
    forcePasswordChange: true,
  });

  // Update village
  village.hasSarpanch = true;
  village.sarpanch = sarpanch._id;
  await village.save();

  // Assign all existing complaints of that village to this sarpanch
  await Complaint.updateMany(
    { village: villageId, status: 'Awaiting Sarpanch Assignment' },
    {
      $set: { sarpanch: sarpanch._id, status: 'Pending' },
      $push: {
        updates: {
          status: 'Pending',
          remark: 'Sarpanch assigned. All pending complaints transferred.',
          updatedBy: req.user._id,
        },
      },
    }
  );

  // Mark sarpanch request as fulfilled
  await SarpanchRequest.findOneAndUpdate(
    { village: villageId },
    { status: 'fulfilled', fulfilledAt: new Date(), sarpanchCreated: sarpanch._id }
  );

  res.status(201).json({ success: true, message: 'Sarpanch created and complaints assigned successfully', sarpanch });
});

// Get all users (paginated, filterable)
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('state', 'name')
      .populate('district', 'name')
      .populate('village', 'name')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
});

// Toggle user active status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// State-wise complaint analytics
exports.getStateAnalytics = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $group: { _id: '$state', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } },
    { $lookup: { from: 'states', localField: '_id', foreignField: '_id', as: 'stateInfo' } },
    { $unwind: '$stateInfo' },
    { $project: { state: '$stateInfo.name', total: 1, resolved: 1, resolutionRate: { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] } } },
    { $sort: { total: -1 } },
  ]);
  res.json({ success: true, data });
});

// Monthly growth chart
exports.getGrowthChart = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const data = await Complaint.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data });
});

// Get all complaints (admin)
exports.getAllComplaints = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, search, state, district } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { complaintNumber: { $regex: search, $options: 'i' } },
  ];
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('citizen', 'name email')
      .populate('sarpanch', 'name email')
      .populate('state', 'name')
      .populate('district', 'name')
      .populate('village', 'name')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Complaint.countDocuments(filter),
  ]);
  res.json({ success: true, complaints, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
});
