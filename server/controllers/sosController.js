const SOSAlert = require('../models/SOSAlert');

// Create a new SOS alert
exports.createSOS = async (req, res, next) => {
  try {
    const alert = await SOSAlert.create({ ...req.body, vendorId: req.user._id });
    res.status(201).json({ success: true, data: alert });
  } catch (error) { next(error); }
};

// Get SOS alerts for vendor or technician
exports.getSOSAlerts = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'TECHNICIAN') {
      query = { technicianId: req.user._id, status: { $ne: 'Resolved' } };
    } else {
      query = { vendorId: req.user._id };
    }
    const alerts = await SOSAlert.find(query).populate('technicianId', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) { next(error); }
};

// Dispatch technician to SOS
exports.dispatchSOS = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    alert.technicianId = req.body.technicianId;
    alert.status = 'Dispatched';
    await alert.save();
    const populated = await SOSAlert.findById(alert._id).populate('technicianId', 'name');
    res.status(200).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

// Technician updates SOS status
exports.updateSOSStatus = async (req, res, next) => {
  try {
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    alert.status = req.body.status;
    await alert.save();
    res.status(200).json({ success: true, data: alert });
  } catch (error) { next(error); }
};
