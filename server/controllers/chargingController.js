const Port = require('../models/Port');
const Session = require('../models/Session');

// --- PORT MANAGEMENT ---

exports.getPorts = async (req, res, next) => {
  try {
    const ports = await Port.find({ vendorId: req.user._id }).sort({ portId: 1 });
    res.status(200).json({ success: true, data: ports });
  } catch (error) { next(error); }
};

exports.addPort = async (req, res, next) => {
  try {
    const port = await Port.create({ ...req.body, vendorId: req.user._id });
    res.status(201).json({ success: true, data: port });
  } catch (error) { next(error); }
};

exports.updatePortStatus = async (req, res, next) => {
  try {
    const port = await Port.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!port) return res.status(404).json({ success: false, message: 'Port not found' });
    res.status(200).json({ success: true, data: port });
  } catch (error) { next(error); }
};

// --- SESSION MANAGEMENT ---

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ vendorId: req.user._id })
      .populate('portId', 'portId type')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) { next(error); }
};

exports.startSession = async (req, res, next) => {
  try {
    const { portId, user, vehicle } = req.body;
    
    const port = await Port.findOne({ _id: portId, vendorId: req.user._id });
    if (!port || port.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Port is not available' });
    }

    const session = await Session.create({
      portId,
      vendorId: req.user._id,
      user,
      vehicle,
      status: 'Active'
    });

    port.status = 'Charging';
    port.currentSessionId = session._id;
    await port.save();

    res.status(201).json({ success: true, data: session });
  } catch (error) { next(error); }
};

exports.stopSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, vendorId: req.user._id, status: 'Active' });
    if (!session) return res.status(404).json({ success: false, message: 'Active session not found' });

    // Calculate mock cost and energy
    const durationHours = (Date.now() - session.startTime.getTime()) / (1000 * 60 * 60);
    session.energyConsumed = parseFloat((durationHours * 22).toFixed(2)); // assume 22kW average
    session.cost = parseFloat((session.energyConsumed * 18).toFixed(2)); // assume 18 INR/kWh
    session.status = 'Completed';
    session.endTime = Date.now();
    await session.save();

    const port = await Port.findById(session.portId);
    if (port) {
      port.status = 'Available';
      port.currentSessionId = null;
      await port.save();
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) { next(error); }
};
