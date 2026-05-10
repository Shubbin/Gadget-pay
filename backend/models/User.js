const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'vendor', 'super_admin', 'customer_care'], 
    default: 'user' 
  },
  tier: { type: String, default: 'Bronze' },
  tier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserTier' },
  kyc_status: { type: String, default: 'unverified' },
  credit_limit: { type: Number, default: 0 },
  escrow_balance: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  interest_discount: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false },
  otp_code: { type: String },
  otp_expires_at: { type: Date },
  nin: { type: String },
  bvn: { type: String },
  cac_number: { type: String },
  cac_url: { type: String },
  card_design: { type: String, default: 'default' },
  is_card_active: { type: Boolean, default: false },
  
  // Vendor specific financial fields
  vendor_commission_rate: { type: Number, default: 5 }, // 5% default
  pending_payout_balance: { type: Number, default: 0 },
  settled_payout_balance: { type: Number, default: 0 },
  bank_details: {
    bank_name: String,
    account_number: String,
    account_name: String
  },

  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
