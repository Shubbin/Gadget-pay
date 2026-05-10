const mongoose = require('mongoose');

const autoDebitSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  installment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Installment' },
  authorization_code: { type: String },
  card_type: { type: String },
  last4: { type: String },
  exp_month: { type: String },
  exp_year: { type: String },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

// Unique index for user and last4
autoDebitSubscriptionSchema.index({ user_id: 1, last4: 1 }, { unique: true });

module.exports = mongoose.model('AutoDebitSubscription', autoDebitSubscriptionSchema);
