const mongoose = require('mongoose');
const JobCard = require('../models/JobCard');
const Session = require('../models/Session');
const Invoice = require('../models/Invoice');
const Port = require('../models/Port');
const SOSAlert = require('../models/SOSAlert');

exports.getVendorDashboardStats = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // 1. Service KPIs
    const activeJobsCount = await JobCard.countDocuments({ 
      vendorId, 
      status: { $in: ['Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check'] } 
    });


    const completedJobs = await JobCard.find({ vendorId, status: 'Completed' });
    let avgRepairTime = '0h';
    if (completedJobs.length > 0) {
      const totalDays = completedJobs.reduce((acc, job) => {
        const start = new Date(job.createdAt);
        const end = new Date(job.updatedAt);
        return acc + ((end - start) / (1000 * 60 * 60)); 
      }, 0);
      avgRepairTime = `${Math.max(1, Math.round(totalDays / completedJobs.length))}h`;
    }

    // 2. Charging KPIs
    const activeSessionsCount = await Session.countDocuments({ vendorId, status: 'Active' });

    // 3. Revenue KPIs (Today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayInvoices = await Invoice.find({ vendorId, status: 'Paid', createdAt: { $gte: startOfToday } });
    const serviceRevenueToday = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const todaySessions = await Session.find({ vendorId, status: 'Completed', endTime: { $gte: startOfToday } });
    const chargingRevenueToday = todaySessions.reduce((sum, sess) => sum + sess.cost, 0);

    const totalRevenueToday = serviceRevenueToday + chargingRevenueToday;

    // 4. Weekly Revenue Chart Data (Last 7 Days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayInvoices = await Invoice.find({ vendorId, status: 'Paid', createdAt: { $gte: d, $lt: nextD } });
      const dayServiceRev = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);

      const daySessions = await Session.find({ vendorId, status: 'Completed', endTime: { $gte: d, $lt: nextD } });
      const dayChargingRev = daySessions.reduce((sum, sess) => sum + sess.cost, 0);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      chartData.push({
        day: dayName,
        service: dayServiceRev || 0,
        charging: dayChargingRev || 0,
      });
    }

    // 5. Active Bays (Recent Jobs)
    const activeBays = await JobCard.find({ 
      vendorId, 
      status: { $in: ['Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check'] } 
    }).sort({ updatedAt: -1 }).limit(5);



    // 6. Active Ports
    const ports = await Port.find({ vendorId });

    // 7. Recent Activity (Unified Feed)
    const recentJobs = await JobCard.find({ vendorId }).sort({ createdAt: -1 }).limit(3);
    const recentSessions = await Session.find({ vendorId }).sort({ createdAt: -1 }).limit(3);
    const recentSOS = await SOSAlert.find({ vendorId }).sort({ createdAt: -1 }).limit(2);

    const recentActivity = [
      ...recentJobs.map(j => ({
        type: 'repair',
        text: `${j.vehicle} — Job Card ${j.status}`,
        time: j.updatedAt,
        createdAt: j.updatedAt
      })),
      ...recentSessions.map(s => ({
        type: 'charge',
        text: `Port ${s.portId ? s.portId : '#'} — Session ${s.status}`,
        time: s.updatedAt,
        createdAt: s.updatedAt
      })),
      ...recentSOS.map(sos => ({
        type: 'sos',
        text: `SOS — ${sos.customer}, ${sos.issue}`,
        time: sos.createdAt,
        createdAt: sos.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          activeJobs: activeJobsCount,
          activeSessions: activeSessionsCount,
          avgRepairTime,
          revenueToday: totalRevenueToday
        },
        chartData,
        activeBays,
        ports,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getVendorEarnings = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Total Lifetime Revenue
    const allInvoices = await Invoice.find({ vendorId, status: 'Paid' });
    const totalServiceRev = allInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const allSessions = await Session.find({ vendorId, status: 'Completed' });
    const totalChargingRev = allSessions.reduce((sum, sess) => sum + sess.cost, 0);

    const lifetimeRevenue = totalServiceRev + totalChargingRev;
    
    // Simulate a wallet balance (e.g. 15% of lifetime revenue hasn't been paid out yet)
    const walletBalance = lifetimeRevenue * 0.15;

    // Weekly Chart Data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayInvoices = await Invoice.find({ vendorId, status: 'Paid', createdAt: { $gte: d, $lt: nextD } });
      const dayServiceRev = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);

      const daySessions = await Session.find({ vendorId, status: 'Completed', endTime: { $gte: d, $lt: nextD } });
      const dayChargingRev = daySessions.reduce((sum, sess) => sum + sess.cost, 0);

      const gross = dayServiceRev + dayChargingRev;
      const commission = gross * 0.12; // 12% total deduction

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      chartData.push({ day: dayName, gross, commission });
    }

    res.status(200).json({
      success: true,
      data: {
        lifetimeRevenue,
        walletBalance,
        chartData
      }
    });
  } catch (err) {
    next(err);
  }
};
