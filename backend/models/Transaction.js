const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  installment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Installment', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  payment_reference: { type: String },
  is_settled_to_vendor: { type: Boolean, default: false },
  settlement_ready_at: { type: Date },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
