const mongoose = require('mongoose');

const userTierSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  min_score: { type: Number },
  max_score: { type: Number },
  interest_discount: { type: Number },
  credit_multiplier: { type: Number }
});

module.exports = mongoose.model('UserTier', userTierSchema);
