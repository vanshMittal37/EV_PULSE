const Payout = require('../models/Payout');

exports.getPayouts = async (req, res, next) => {
  try {
    const payouts = await Payout.find({ vendorId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payouts });
  } catch (error) { next(error); }
};

exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    // In a real app, you'd check wallet balance here
    const payout = await Payout.create({
      vendorId: req.user._id,
      amount,
      status: 'Processing'
    });
    res.status(201).json({ success: true, data: payout });
  } catch (error) { next(error); }
};
