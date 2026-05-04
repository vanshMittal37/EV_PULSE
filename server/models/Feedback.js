const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard' },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reply: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
