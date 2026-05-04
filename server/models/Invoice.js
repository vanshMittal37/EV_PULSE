const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard' }, 
  customer: { type: String, required: true },
  vehicle: { type: String, required: true },
  baseFee: { type: Number, required: true },
  laborCharges: { type: Number, required: true },
  partsTotal: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
