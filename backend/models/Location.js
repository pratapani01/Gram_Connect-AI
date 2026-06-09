const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
districtSchema.index({ state: 1, name: 1 }, { unique: true });

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  pincode: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  // Sarpanch assignment
  hasSarpanch: { type: Boolean, default: false },
  sarpanch: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
villageSchema.index({ district: 1, name: 1 }, { unique: true });

module.exports = {
  State: mongoose.model('State', stateSchema),
  District: mongoose.model('District', districtSchema),
  Village: mongoose.model('Village', villageSchema),
};
