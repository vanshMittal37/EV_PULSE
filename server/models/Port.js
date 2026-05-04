const mongoose = require('mongoose');

const portSchema = new mongoose.Schema({
  portId: { type: String, required: true }, // e.g. P1, P2
  type: { type: String, required: true }, // e.g., 'CCS2', 'Type 2'
  power: { type: String, required: true }, // e.g., '50 kW', '22 kW'
  status: { type: String, enum: ['Available', 'Charging', 'Offline', 'Maintenance'], default: 'Available' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // If currently charging:
  currentSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Port', portSchema);
