const mongoose = require('mongoose');

const jobCardSchema = new mongoose.Schema({
  vehicle: {
    type: String,
    required: true
  },
  plate: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Diagnostic', 'In-Repair', 'Parts Pending', 'Quality Check', 'Ready for Delivery', 'Completed'],
    default: 'Diagnostic'
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: [String],
  parts: [{
    name: String,
    cost: Number
  }],
  laborCost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobCard', jobCardSchema);
