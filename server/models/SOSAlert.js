const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: { type: String, required: true },
  plate: { type: String, required: true },
  issue: { type: String, required: true },
  urgency: { type: String, enum: ['Critical', 'Standard'], default: 'Standard' },
  location: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'On-Site', 'Resolved'],
    default: 'Pending'
  },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
