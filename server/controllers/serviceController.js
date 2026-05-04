const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');
const JobCard = require('../models/JobCard');

// --- INVOICES ---

exports.getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ vendorId: req.user._id })
      .populate('jobId', 'type')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) { next(error); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create({ ...req.body, vendorId: req.user._id });
    // If linked to a job, we could update job status to Billed/Paid here
    res.status(201).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

// --- FEEDBACKS ---

exports.getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ vendorId: req.user._id })
      .populate('technicianId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) { next(error); }
};

exports.createFeedback = async (req, res, next) => {
  // Usually done by customer app, but we expose it for testing/seeding
  try {
    const feedback = await Feedback.create({ ...req.body, vendorId: req.user._id });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) { next(error); }
};

exports.replyToFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.user._id },
      { reply: req.body.reply },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) { next(error); }
};


