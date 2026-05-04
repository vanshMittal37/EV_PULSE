const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, businessName, contactNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'USER',
      businessName,
      contactNumber,
      status: role ? (role === 'SUPER_ADMIN' ? 'ACTIVE' : 'PENDING') : 'PENDING'
    });

    // Generate token
    const token = generateToken(user._id);

    // Emit event for real-time admin updates
    if (req.io && (user.role !== 'USER' && user.role !== 'TECHNICIAN')) {
      req.io.to('SUPER_ADMIN').emit('new-vendor', {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if the role matches
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized access. You are registered as ${user.role.replace('_', ' ')}. Please select the correct role above.`,
      });
    }

    if (user.status !== 'ACTIVE' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Your account is awaiting Super Admin approval.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const { getScheduledStatus } = require('../utils/stationHelpers');

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Update status based on schedule
    const newStatus = getScheduledStatus(user);
    if (user.stationStatus !== newStatus) {
      await User.findByIdAndUpdate(req.user.id, { stationStatus: newStatus });
      user.stationStatus = newStatus;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Add a technician
 * @route   POST /api/auth/technician
 * @access  Private (Service Vendor)
 */
const addTechnician = async (req, res, next) => {
  try {
    const { name, email, password, contactNumber, specialization, techLevel } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const technician = await User.create({
      name,
      email,
      password,
      role: 'TECHNICIAN',
      contactNumber,
      specialization,
      techLevel,
      vendorId: req.user._id,
      status: 'ACTIVE' // Technicians created by vendors are active immediately
    });

    res.status(201).json({
      success: true,
      data: technician
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all technicians for a vendor
 * @route   GET /api/auth/technicians
 * @access  Private (Service Vendor)
 */
const getTechnicians = async (req, res, next) => {
  try {
    const vendorIdStr = req.user._id.toString();
    console.log(`Searching for technicians linked to Vendor ID: ${vendorIdStr}`);
    
    // Find all technicians first to debug
    const allTechnicians = await User.find({ role: 'TECHNICIAN' });
    console.log(`Total technicians in database: ${allTechnicians.length}`);
    
    // Filter technicians for this specific vendor
    const technicians = allTechnicians.filter(t => {
      const tVendorId = t.vendorId ? t.vendorId.toString() : null;
      return tVendorId === vendorIdStr;
    });
    
    console.log(`Found ${technicians.length} technicians matching this vendor`);
    
    res.status(200).json({
      success: true,
      count: technicians.length,
      searchedForVendor: vendorIdStr,
      totalTechsInDb: allTechnicians.length,
      data: technicians
    });
  } catch (error) {
    console.error('Error in getTechnicians:', error);
    next(error);
  }
};

/**
 * @desc    Upload document for a vendor
 * @route   PUT /api/auth/upload-document
 * @access  Private
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { address, lat, lng, numberOfPorts } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (address) user.address = address;
    if (lat && lng) {
      user.locationCoordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }
    user.numberOfPorts = numberOfPorts ? parseInt(numberOfPorts) : 2;

    const documentObj = {
      name: req.file.originalname,
      url: req.file.path // Cloudinary URL
    };

    user.documents.push(documentObj);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a user with their documents in a single step
 * @route   POST /api/auth/register-with-documents
 * @access  Public
 */
const registerWithDocuments = async (req, res, next) => {
  try {
    const { name, email, password, role, businessName, contactNumber, address, lat, lng, numberOfPorts } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'STATION_VENDOR',
      businessName,
      contactNumber,
      status: 'PENDING',
      address,
      numberOfPorts: numberOfPorts ? parseInt(numberOfPorts) : 2,
      locationCoordinates: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
    });

    const documentObj = {
      name: req.file.originalname,
      url: req.file.path,
      type: req.file.mimetype,
      uploadedAt: new Date()
    };

    user.documents.push(documentObj);
    await user.save();

    // Emit event for real-time admin updates
    if (req.io) {
      req.io.to('SUPER_ADMIN').emit('new-vendor', {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created and documents submitted for review',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update station status (Active/Maintenance)
 * @route   PUT /api/auth/update-station-status
 * @access  Private
 */
const updateStationStatus = async (req, res, next) => {
  try {
    const { stationStatus } = req.body;
    
    if (!['Active', 'Offline', 'Maintenance'].includes(stationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid station status' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { stationStatus },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Emit event for real-time admin updates
    if (req.io) {
      req.io.to('SUPER_ADMIN').emit('station-status-change', {
        vendorId: user._id,
        stationStatus: user.stationStatus,
        businessName: user.businessName
      });
    }

    res.status(200).json({
      success: true,
      data: user.stationStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      businessName: req.body.businessName,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      description: req.body.description,
      amenities: req.body.amenities,
      is24x7: req.body.is24x7,
      schedule: req.body.schedule,
      taxId: req.body.taxId,
      bankDetails: req.body.bankDetails
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload station image
 * @route   PUT /api/auth/upload-station-image
 * @access  Private
 */
const uploadStationImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.stationImages.push(req.file.path);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.stationImages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete station image
 * @route   DELETE /api/auth/station-image
 * @access  Private
 */
const deleteStationImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.stationImages = user.stationImages.filter(img => img !== imageUrl);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.stationImages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  addTechnician,
  getTechnicians,
  uploadDocument,
  registerWithDocuments,
  updateStationStatus,
  updateProfile,
  uploadStationImage,
  deleteStationImage,
  changePassword
};
