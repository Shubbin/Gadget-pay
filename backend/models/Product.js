const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  specs: { type: mongoose.Schema.Types.Mixed }, // JSONB equivalent
  image_url: { type: String },
  inventory: { type: Number, default: 10 },
  rating: { type: Number, default: 4.5 },
  installment_eligible: { type: Boolean, default: true },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [String],
  metadata: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
