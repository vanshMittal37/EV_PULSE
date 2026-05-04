const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bank: {
      type: String,
      default: 'Registered Account',
    },
    status: {
      type: String,
      enum: ['Processing', 'Paid', 'Failed'],
      default: 'Processing',
    },
    payoutId: {
      type: String,
      unique: true,
      default: () => `PO-${Math.floor(100000 + Math.random() * 900000)}`
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payout', payoutSchema);
