const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminExists = await User.findOne({ email: 'superadmin@evconnect.com' });

    if (adminExists) {
      console.log('Super Admin already exists.');
      process.exit();
    }

    const superAdmin = await User.create({
      name: 'Global Super Admin',
      email: 'superadmin@evconnect.com',
      password: 'AdminPassword@123',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      businessName: 'EV Connect Headquarters',
      contactNumber: '+1234567890'
    });

    console.log('✅ Super Admin created successfully!');
    console.log('Email: superadmin@evconnect.com');
    console.log('Password: AdminPassword@123');
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
