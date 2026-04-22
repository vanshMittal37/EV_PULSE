const User = require('../models/User');

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ 
      role: { $in: ['STATION_VENDOR', 'SERVICE_VENDOR', 'HYBRID_VENDOR'] } 
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update vendor status
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    user = await User.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getVendors,
  updateVendorStatus
};
