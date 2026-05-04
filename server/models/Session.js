const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  portId: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: String, required: true },
  vehicle: { type: String, required: true },
  energyConsumed: { type: Number, default: 0 }, // in kWh
  cost: { type: Number, default: 0 }, // in INR
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
