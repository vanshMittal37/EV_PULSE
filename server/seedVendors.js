const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const dummyVendors = [
  {
    name: 'R. Singh',
    email: 'singh@mishraev.com',
    password: 'password123',
    businessName: 'Mishra EV Hub',
    contactNumber: '+91 98765 43210',
    address: 'Plot 42, Knowledge Park III, Greater Noida, UP',
    gstNumber: '09AAACM4128L1Z1',
    role: 'HYBRID_VENDOR',
    status: 'PENDING'
  },
  {
    name: 'A. Khan',
    email: 'khan@nexacharge.co',
    password: 'password123',
    businessName: 'Nexa Charging',
    contactNumber: '+91 88888 12345',
    address: 'Nexa Tower, MG Road, Gurgaon, Haryana',
    gstNumber: '06BCCM5521K2Z4',
    role: 'STATION_VENDOR',
    status: 'ACTIVE'
  },
  {
    name: 'S. Gupta',
    email: 'gupta@apex.in',
    password: 'password123',
    businessName: 'Apex Service Center',
    contactNumber: '+91 77777 99999',
    address: 'Shop 12, Auto Market, Okhla Phase III, Delhi',
    gstNumber: '07CCDM9912J3Z9',
    role: 'SERVICE_VENDOR',
    status: 'ACTIVE'
  },
  {
    name: 'L. Chen',
    email: 'chen@citypower.com',
    password: 'password123',
    businessName: 'City Power Solutions',
    contactNumber: '+91 99999 55555',
    address: 'Power Plaza, HSR Layout, Bangalore, Karnataka',
    gstNumber: '29EEEM1122H5Z2',
    role: 'STATION_VENDOR',
    status: 'SUSPENDED'
  }
];

const seedVendors = async () => {
  await connectDB();

  try {
    // Delete existing vendors first to avoid duplicates
    await User.deleteMany({ role: { $in: ['STATION_VENDOR', 'SERVICE_VENDOR', 'HYBRID_VENDOR'] } });
    
    console.log('Seeding dummy vendors...');
    await User.create(dummyVendors);
    
    console.log('Dummy vendors seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
};

seedVendors();
