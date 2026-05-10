const mongoose = require('mongoose');

const kycVerificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document_type: { type: String }, // NIN, Passport, Student ID
  document_url: { type: String },
  status: { type: String, default: 'pending' },
  admin_notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('KYCVerification', kycVerificationSchema);
