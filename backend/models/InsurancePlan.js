const mongoose = require('mongoose');

const insurancePlanSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  monthly_premium: { type: Number },
  coverage_limit: { type: Number }
});

module.exports = mongoose.model('InsurancePlan', insurancePlanSchema);
