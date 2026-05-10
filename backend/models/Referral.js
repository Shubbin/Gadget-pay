const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  reward_claimed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);
