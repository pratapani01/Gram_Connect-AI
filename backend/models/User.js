const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  mobile: { type: String, trim: true },
  role: { type: String, enum: ['citizen', 'sarpanch', 'admin'], default: 'citizen' },

  // Location (citizen & sarpanch)
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
  address: { type: String, trim: true },

  profilePicture: { type: String, default: '' },
  profilePicturePublicId: { type: String, default: '' },

  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  forcePasswordChange: { type: Boolean, default: false },

  // Refresh token storage
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],

  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

// Index for refresh token cleanup
userSchema.index({ 'refreshTokens.createdAt': 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

module.exports = mongoose.model('User', userSchema);
