const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema({
  status: { type: String, required: true },
  remark: { type: String, trim: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [{ url: String, publicId: String }],
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  complaintNumber: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Water Supply', 'Electricity', 'Drainage', 'Road Damage', 'Garbage', 'Street Light', 'Public Property', 'Education', 'Health', 'Other'],
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },

  status: {
    type: String,
    enum: ['Awaiting Sarpanch Assignment', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Escalated'],
    default: 'Pending',
  },

  images: [{ url: String, publicId: String }],
  resolutionImages: [{ url: String, publicId: String }],

  // Location
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', required: true },
  address: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },

  // People
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sarpanch: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Resolution
  resolutionNote: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },

  // Escalation
  escalatedAt: { type: Date },
  isEscalated: { type: Boolean, default: false },
  escalationDays: { type: Number, default: 15 },

  updates: [complaintUpdateSchema],

  resolvedAt: { type: Date },
  rejectedAt: { type: Date },
}, { timestamps: true });

// Auto-generate complaint number
complaintSchema.pre('save', async function(next) {
  if (!this.complaintNumber) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintNumber = `GC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

complaintSchema.index({ citizen: 1, status: 1 });
complaintSchema.index({ sarpanch: 1, status: 1 });
complaintSchema.index({ village: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
