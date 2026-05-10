const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  total_installments: { type: Number, required: true },
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'], 
    required: true 
  },
  total_amount: { type: Number },
  remaining_balance: { type: Number, required: true },
  next_payment_date: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'overdue'], 
    default: 'active' 
  },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Installment', installmentSchema);
