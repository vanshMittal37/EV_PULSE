const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const JobCard = require('../models/JobCard');
const SOSAlert = require('../models/SOSAlert');
const Port = require('../models/Port');
const Session = require('../models/Session');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');

dotenv.config({ path: '../.env' }); // Adjust path if needed depending on where script is run

const clearDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    console.log('Clearing database collections (except SUPER_ADMIN)...');
    
    // Clear functional collections
    await JobCard.deleteMany({});
    await SOSAlert.deleteMany({});
    await Port.deleteMany({});
    await Session.deleteMany({});
    await Invoice.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Deleted operational data (Jobs, SOS, Ports, Sessions, Invoices, Feedbacks).');

    // Keep SUPER_ADMIN, delete others
    const result = await User.deleteMany({ role: { $ne: 'SUPER_ADMIN' } });
    console.log(`Deleted ${result.deletedCount} non-admin users/vendors/technicians.`);

    console.log('Database successfully cleared for testing!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDB();
