const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  insurance_id: { type: Number }, // Keep as number for now to match logic
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  total_amount: { type: Number, required: true },
  
  // Commission & Payout fields
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor_payout_amount: { type: Number }, // Price - Commission
  platform_commission: { type: Number }, // The 5% or fixed cut
  payout_status: { 
    type: String, 
    enum: ['unprocessed', 'pending', 'settled', 'paid'], 
    default: 'unprocessed' 
  },
  
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
