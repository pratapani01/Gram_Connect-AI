const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error.middleware');

// Get sarpanch village stats
exports.getVillageStats = asyncHandler(async (req, res) => {
  const sarpanchId = req.user._id;
  const villageId = req.user.village._id || req.user.village;

  const [stats, totalCitizens] = await Promise.all([
    Complaint.aggregate([
      { $match: { sarpanch: sarpanchId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    User.countDocuments({ village: villageId, role: 'citizen' }),
  ]);

  const result = {
    total: 0, Pending: 0, 'In Progress': 0, Resolved: 0,
    Rejected: 0, Escalated: 0, Assigned: 0, totalCitizens,
  };
  stats.forEach(s => { result[s._id] = s.count; result.total += s.count; });

  res.json({ success: true, stats: result });
});

// Category distribution
exports.getCategoryStats = asyncHandler(async (req, res) => {
  const data = await Complaint.aggregate([
    { $match: { sarpanch: req.user._id } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data });
});

// Monthly trend
exports.getMonthlyTrend = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const data = await Complaint.aggregate([
    { $match: { sarpanch: req.user._id, createdAt: { $gte: twelveMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  res.json({ success: true, data });
});

// Get citizens in village
exports.getVillageCitizens = asyncHandler(async (req, res) => {
  const villageId = req.user.village._id || req.user.village;
  const citizens = await User.find({ village: villageId, role: 'citizen' })
    .select('name email mobile profilePicture createdAt lastLogin')
    .sort({ createdAt: -1 });
  res.json({ success: true, citizens });
});
