const Complaint = require('../models/Complaint');
const { Village } = require('../models/Location');
const SarpanchRequest = require('../models/SarpanchRequest');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error.middleware');
const {
  notifyComplaintSubmitted,
  notifyStatusChange,
  notifyNewComplaint,
} = require('../utils/notification');

const buildPopulate = () => [
  { path: 'citizen', select: 'name email mobile profilePicture' },
  { path: 'sarpanch', select: 'name email mobile' },
  { path: 'state', select: 'name' },
  { path: 'district', select: 'name' },
  { path: 'village', select: 'name' },
  { path: 'updates.updatedBy', select: 'name role' },
];

// Create complaint
exports.createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, address, latitude, longitude } = req.body;
  const citizen = req.user;

  // Get images from cloudinary upload
  const images = req.files ? req.files.map(f => ({ url: f.path, publicId: f.filename })) : [];

  // Find village and its sarpanch
  const village = await Village.findById(citizen.village._id || citizen.village);

  let sarpanchId = null;
  let status = 'Awaiting Sarpanch Assignment';

  if (village?.hasSarpanch && village.sarpanch) {
    sarpanchId = village.sarpanch;
    status = 'Pending';
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority || 'Medium',
    images,
    address,
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    state: citizen.state._id || citizen.state,
    district: citizen.district._id || citizen.district,
    village: citizen.village._id || citizen.village,
    citizen: citizen._id,
    sarpanch: sarpanchId,
    status,
    updates: [{
      status,
      remark: 'Complaint submitted by citizen',
      updatedBy: citizen._id,
    }],
  });

  // Update sarpanch request complaint count
  await SarpanchRequest.findOneAndUpdate(
    { village: citizen.village._id || citizen.village },
    { $inc: { complaintCount: 1 } }
  );

  await notifyComplaintSubmitted(citizen, complaint);

  if (sarpanchId) {
    await notifyNewComplaint(sarpanchId, complaint);
  }

  const populated = await Complaint.findById(complaint._id).populate(buildPopulate());
  res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint: populated });
});

// Get complaints (role-based)
exports.getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const user = req.user;

  let filter = {};
  if (user.role === 'citizen') filter.citizen = user._id;
  else if (user.role === 'sarpanch') filter.sarpanch = user._id;
  // admin sees all

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { complaintNumber: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
  ];

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(filter).populate(buildPopulate()).sort(sort).skip(skip).limit(parseInt(limit)),
    Complaint.countDocuments(filter),
  ]);

  res.json({
    success: true,
    complaints,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
});

// Get single complaint
exports.getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id).populate(buildPopulate());
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Access check
  const user = req.user;
  if (user.role === 'citizen' && complaint.citizen._id.toString() !== user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  if (user.role === 'sarpanch' && complaint.sarpanch?._id.toString() !== user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, complaint });
});

// Update complaint status (Sarpanch / Admin)
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, remark, resolutionNote } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Sarpanch can only update their own village complaints
  if (req.user.role === 'sarpanch' && complaint.sarpanch?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const prevStatus = complaint.status;
  complaint.status = status;
  if (resolutionNote) complaint.resolutionNote = resolutionNote;
  if (status === 'Rejected') complaint.rejectionReason = remark;
  if (status === 'Resolved') complaint.resolvedAt = new Date();
  if (status === 'Rejected') complaint.rejectedAt = new Date();

  // Handle resolution images
  if (req.files && req.files.length > 0) {
    complaint.resolutionImages = req.files.map(f => ({ url: f.path, publicId: f.filename }));
  }

  complaint.updates.push({
    status,
    remark,
    updatedBy: req.user._id,
  });

  await complaint.save();

  if (prevStatus !== status) {
    await notifyStatusChange(complaint.citizen, complaint, status, remark);
  }

  const populated = await Complaint.findById(complaint._id).populate(buildPopulate());
  res.json({ success: true, message: 'Complaint updated successfully', complaint: populated });
});

// Stats for dashboard
exports.getStats = asyncHandler(async (req, res) => {
  const user = req.user;
  let matchFilter = {};
  if (user.role === 'citizen') matchFilter.citizen = user._id;
  else if (user.role === 'sarpanch') matchFilter.sarpanch = user._id;

  const stats = await Complaint.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const result = {
    total: 0,
    'Awaiting Sarpanch Assignment': 0,
    Pending: 0,
    Assigned: 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
    Escalated: 0,
  };

  stats.forEach(s => {
    result[s._id] = s.count;
    result.total += s.count;
  });

  res.json({ success: true, stats: result });
});

// Monthly trend (for charts)
exports.getMonthlyTrend = asyncHandler(async (req, res) => {
  const user = req.user;
  let matchFilter = {};
  if (user.role === 'citizen') matchFilter.citizen = user._id;
  else if (user.role === 'sarpanch') matchFilter.sarpanch = user._id;

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  matchFilter.createdAt = { $gte: twelveMonthsAgo };

  const data = await Complaint.aggregate([
    { $match: matchFilter },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data });
});
