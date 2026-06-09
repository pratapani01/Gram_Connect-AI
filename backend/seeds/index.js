require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { State, District, Village } = require('../models/Location');
const User = require('../models/User');

// Inline location data (same as locationSeed.js) - abbreviated for seed/index
const locationData = require('./locationSeed').locationData || [];

async function runAllSeeds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🌱 Running all seeds...\n');

    // Seed admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gramconnect.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ name: 'Super Admin', email: adminEmail, password: adminPassword, role: 'admin' });
      console.log('✅ Super Admin seeded');
    } else {
      console.log('ℹ️  Admin already exists, skipping');
    }

    console.log('\n✅ All seeds complete!');
    console.log('\n📝 Run location seed separately:');
    console.log('   node seeds/locationSeed.js');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

runAllSeeds();
