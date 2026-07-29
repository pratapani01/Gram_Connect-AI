require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@gramconnect.ai';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await User.findOne({ $or: [{ email }, { role: 'admin' }] });
    if (existing) {
      console.log('ℹ️  Admin already exists:', email);
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email,
      password,
      role: 'admin',
      isActive: true,
      isVerified: true,
      forcePasswordChange: false,
    });

    console.log('✅ Super Admin created successfully');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Admin seed error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
