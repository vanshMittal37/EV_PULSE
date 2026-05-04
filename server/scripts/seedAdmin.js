const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Check if SUPER_ADMIN already exists
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingAdmin) {
      console.log('Super Admin already exists:', existingAdmin.email);
    } else {
      console.log('Creating Super Admin...');
      const admin = await User.create({
        name: 'Super Admin',
        email: 'admin@evconnect.com',
        password: 'admin123', // will be hashed by the User model's pre-save middleware
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      });
      console.log('Super Admin created successfully:', admin.email, '/ admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
