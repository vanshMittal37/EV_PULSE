const User = require('../models/User');
const Session = require('../models/Session');
const JobCard = require('../models/JobCard');
const Invoice = require('../models/Invoice');
const SOSAlert = require('../models/SOSAlert');
const { getScheduledStatus } = require('../utils/stationHelpers');

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ 
      role: { $in: ['STATION_VENDOR', 'SERVICE_VENDOR', 'HYBRID_VENDOR'] } 
    }).sort('-createdAt');

    // Update statuses based on schedule for each vendor
    for (let vendor of vendors) {
      const newStatus = getScheduledStatus(vendor);
      if (vendor.stationStatus !== newStatus) {
        vendor.stationStatus = newStatus;
        await vendor.save();
      }
    }

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error(error);
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
    const validStatuses = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Vendor not found' });

    let stationStatus = user.stationStatus;
    if (status === 'ACTIVE') {
      stationStatus = 'Active';
    } else if (status === 'SUSPENDED' || status === 'REJECTED' || status === 'PENDING') {
      stationStatus = 'Offline';
    }

    user = await User.findByIdAndUpdate(
      req.params.id, { status, stationStatus }, { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Global Platform Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getGlobalStats = async (req, res, next) => {
  try {
    const totalUsersCount = await User.countDocuments({ role: 'USER' });
    const totalVendorsCount = await User.countDocuments({ role: { $nin: ['SUPER_ADMIN', 'USER'] } });
    const debugAllUsers = await User.countDocuments({});
    const allRoles = await User.distinct('role');

    const invoices = await Invoice.find({ status: 'Paid' });
    const serviceRev = invoices.reduce((sum, inv) => sum + inv.total, 0);
    
    const sessions = await Session.find({ status: 'Completed' });
    const chargeRev = sessions.reduce((sum, sess) => sum + sess.cost, 0);
    
    const totalRevenue = serviceRev + chargeRev;

    const activeSessionsCount = await Session.countDocuments({ status: 'Active' });
    const activeJobsCount = await JobCard.countDocuments({ status: { $nin: ['Completed', 'Ready for Delivery'] } });
    const activeSOS = await SOSAlert.countDocuments({ status: { $ne: 'Resolved' } });

    // Recent Activity (Unified)
    const recentJobs = await JobCard.find().sort({ createdAt: -1 }).limit(5).populate('vendorId', 'name');
    const recentSOS = await SOSAlert.find().sort({ createdAt: -1 }).limit(5).populate('vendorId', 'name');
    const recentSessions = await Session.find().sort({ createdAt: -1 }).limit(5).populate('vendorId', 'name');

    const recentActivities = [
      ...recentJobs.map(j => ({
        time: j.updatedAt,
        action: `Job Card: ${j.status}`,
        user: j.vendorId?.name || 'Unknown Vendor',
        status: j.status === 'Completed' ? 'Success' : 'Pending',
        createdAt: j.updatedAt
      })),
      ...recentSOS.map(s => ({
        time: s.createdAt,
        action: `SOS Alert: ${s.issue.split('—')[0]}`,
        user: s.vendorId?.name || 'Unknown Vendor',
        status: s.status === 'Resolved' ? 'Success' : 'Pending',
        createdAt: s.createdAt
      })),
      ...recentSessions.map(sess => ({
        time: sess.updatedAt,
        action: `Charging: ${sess.status}`,
        user: sess.vendorId?.name || 'Unknown Vendor',
        status: sess.status === 'Completed' ? 'Success' : 'Pending',
        createdAt: sess.updatedAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    // User Growth (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const userGrowth = await User.aggregate([
      { $match: { role: 'USER', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Utilization Trend (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessionTrend = await Session.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const jobTrend = await JobCard.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Combine trends
    const utilizationData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const s = sessionTrend.find(t => t._id === dateStr)?.count || 0;
      const j = jobTrend.find(t => t._id === dateStr)?.count || 0;
      utilizationData.unshift({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        utilization: s + j
      });
    }

    // Top Vendors
    const topVendors = await User.find({ 
      role: { $nin: ['USER', 'SUPER_ADMIN', 'TECHNICIAN'] } 
    }).limit(5);

    const vendorStats = await Promise.all(topVendors.map(async (v) => {
      const vSessions = await Session.countDocuments({ vendorId: v._id });
      const vJobs = await JobCard.countDocuments({ vendorId: v._id });
      const performance = Math.min(100, (vSessions + vJobs) * 10 + 70); // Simulated performance logic based on activity
      return {
        name: v.businessName || v.name,
        location: v.address ? v.address.split(',').pop().trim() : 'India',
        performance,
        status: performance > 90 ? 'Elite' : 'Pro'
      };
    }));

    // Map Data
    const mapData = await User.find({ 
      role: { $nin: ['USER', 'SUPER_ADMIN', 'TECHNICIAN'] },
      'locationCoordinates.lat': { $ne: null }
    }).select('businessName stationStatus locationCoordinates');

    // Sparkline Trends (Last 5 Months)
    const fiveMonthsAgoTrend = new Date();
    fiveMonthsAgoTrend.setMonth(fiveMonthsAgoTrend.getMonth() - 4);
    fiveMonthsAgoTrend.setDate(1);

    const userTrend = await User.aggregate([
      { $match: { role: 'USER', createdAt: { $gte: fiveMonthsAgoTrend } } },
      { $group: { _id: { $month: "$createdAt" }, val: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);

    const vendorTrend = await User.aggregate([
      { $match: { role: { $nin: ['USER', 'SUPER_ADMIN', 'TECHNICIAN'] }, createdAt: { $gte: fiveMonthsAgoTrend } } },
      { $group: { _id: { $month: "$createdAt" }, val: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);

    const revenueTrend = await Invoice.aggregate([
      { $match: { status: 'Paid', createdAt: { $gte: fiveMonthsAgoTrend } } },
      { $group: { _id: { $month: "$createdAt" }, val: { $sum: "$total" } } },
      { $sort: { "_id": 1 } }
    ]);

    // Format trends for frontend (ensuring 5 data points)
    const formatTrend = (trendData) => {
      const result = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const val = trendData.find(t => t._id === m)?.val || 0;
        result.push({ val });
      }
      return result;
    };

    res.status(200).json({
      success: true,
      data: {
        activeUsers: totalUsersCount,
        totalVendors: totalVendorsCount,
        debug: { total: debugAllUsers, roles: allRoles },
        totalRevenue: totalRevenue,
        activeSessions: activeSessionsCount,
        activeJobs: activeJobsCount,
        activeSOS: activeSOS,
        serviceRev: serviceRev,
        chargeRev: chargeRev,
        recentActivity: recentActivities,
        userGrowth: userGrowth.map(g => ({
          week: `M${g._id.month}`,
          users: g.users
        })),
        utilizationTrend: utilizationData,
        vendorStats: vendorStats,
        mapData: mapData.map(m => ({
          top: `${((m.locationCoordinates.lat - 8) / (37 - 8)) * 100}%`,
          left: `${((m.locationCoordinates.lng - 68) / (97 - 68)) * 100}%`,
          label: m.businessName,
          status: m.stationStatus
        })),
        trends: {
          users: formatTrend(userTrend),
          vendors: formatTrend(vendorTrend),
          revenue: formatTrend(revenueTrend),
          operations: formatTrend([]) // Could be session + jobs if needed
        }
      }
    });
  } catch (error) { 
    console.error(error);
    next(error); 
  }
};

// @desc    Permanently delete a vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private/Admin
const deleteVendor = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, message: 'Vendor permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Register a vendor directly (Admin Flow)
// @route   POST /api/admin/vendors/register
// @access  Private/Admin
const adminRegisterVendor = async (req, res, next) => {
  try {
    const { name, email, password, role, businessName, contactNumber, address, lat, lng, numberOfPorts } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = new User({
      name, email, password, role, businessName, contactNumber, address,
      status: 'ACTIVE',
      stationStatus: (role === 'STATION_VENDOR' || role === 'HYBRID_VENDOR') ? 'Active' : 'Offline',
      numberOfPorts: numberOfPorts || 2,
      locationCoordinates: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
    });

    await user.save();
    res.status(201).json({ success: true, message: 'Vendor registered successfully', data: user });
  } catch (error) { next(error); }
};

module.exports = {
  getVendors,
  updateVendorStatus,
  getGlobalStats,
  deleteVendor,
  adminRegisterVendor
};
