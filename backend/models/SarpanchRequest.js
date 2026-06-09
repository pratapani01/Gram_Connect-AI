const mongoose = require('mongoose');

const sarpanchRequestSchema = new mongoose.Schema({
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village', required: true, unique: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  citizenCount: { type: Number, default: 0 },
  complaintCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' },
  fulfilledAt: { type: Date },
  sarpanchCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('SarpanchRequest', sarpanchRequestSchema);
