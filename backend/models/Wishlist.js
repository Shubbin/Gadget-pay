const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  created_at: { type: Date, default: Date.now }
});

wishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
