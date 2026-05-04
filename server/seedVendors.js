const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const dummyVendors = [
  {
    // ── Vendor 1: Mishra EV Hub (LOGIN: singh@mishraev.com / password123)
    name:            'R. Singh',
    email:           'singh@mishraev.com',
    password:        'password123',
    businessName:    'Mishra EV Hub',
    contactNumber:   '+91 98765 43210',
    address:         'Plot 42, Knowledge Park III, Greater Noida, Uttar Pradesh 201308',
    gstNumber:       '09AAACM4128L1Z1',
    role:            'STATION_VENDOR',
    status:          'ACTIVE',
    // Station fields (1:1 model)
    numberOfPorts:   4,
    portTypes:       ['CCS2', 'Type 2', 'CHAdeMO'],
    stationStatus:   'Active',
    locationCoordinates: { lat: 28.5355, lng: 77.3910 },
  },
  {
    // ── Vendor 2: Nexa Charging Hub
    name:            'A. Khan',
    email:           'khan@nexacharge.co',
    password:        'password123',
    businessName:    'Nexa Charging Hub',
    contactNumber:   '+91 88888 12345',
    address:         'Nexa Tower, MG Road, Gurgaon, Haryana 122002',
    gstNumber:       '06BCCM5521K2Z4',
    role:            'STATION_VENDOR',
    status:          'ACTIVE',
    numberOfPorts:   2,
    portTypes:       ['CCS2', 'CHAdeMO'],
    stationStatus:   'Active',
    locationCoordinates: { lat: 28.4595, lng: 77.0266 },
  },
  {
    // ── Vendor 3: Apex Service Center (service only — no station fields needed)
    name:            'S. Gupta',
    email:           'gupta@apex.in',
    password:        'password123',
    businessName:    'Apex Service Center',
    contactNumber:   '+91 77777 99999',
    address:         'Shop 12, Auto Market, Okhla Phase III, Delhi 110020',
    gstNumber:       '07CCDM9912J3Z9',
    role:            'SERVICE_VENDOR',
    status:          'ACTIVE',
  },
  {
    // ── Vendor 4: City Power Solutions (suspended — station forced offline)
    name:            'L. Chen',
    email:           'chen@citypower.com',
    password:        'password123',
    businessName:    'City Power Solutions',
    contactNumber:   '+91 99999 55555',
    address:         'Power Plaza, HSR Layout, Bangalore, Karnataka 560102',
    gstNumber:       '29EEEM1122H5Z2',
    role:            'STATION_VENDOR',
    status:          'SUSPENDED',
    numberOfPorts:   2,
    portTypes:       ['Type 2'],
    stationStatus:   'Offline',   // auto-set because vendor is SUSPENDED
    locationCoordinates: { lat: 12.9716, lng: 77.5946 },
  },
  {
    // ── Vendor 5: EcoDrive Station (PENDING — awaiting approval)
    name:            'M. Patel',
    email:           'patel@ecodrive.in',
    password:        'password123',
    businessName:    'EcoDrive Station',
    contactNumber:   '+91 95555 12312',
    address:         'A-12, BKC Complex, Bandra, Mumbai, Maharashtra 400051',
    gstNumber:       '27FFFM3344G7Z5',
    role:            'STATION_VENDOR',
    status:          'PENDING',
    numberOfPorts:   6,
    portTypes:       ['CCS2', 'Type 2', 'CHAdeMO'],
    stationStatus:   'Offline',   // offline until approved
    locationCoordinates: { lat: 19.0760, lng: 72.8777 },
  },
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
