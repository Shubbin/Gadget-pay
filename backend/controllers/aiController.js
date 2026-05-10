const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');

exports.getRecommendations = async (req, res) => {
  const { productId } = req.params;
  try {
    const targetProduct = await Product.findById(productId);
    if (!targetProduct) throw new Error('Product not found');

    // Simple Recommendation: Same category, excluding current product
    const recommendations = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: targetProduct.category },
        { tags: { $in: targetProduct.tags || [] } }
      ]
    }).limit(4);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPersonalizedSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get products already in wishlist
    const wishlistedItems = await Wishlist.find({ user_id: userId }).select('product_id');
    const wishlistedIds = wishlistedItems.map(i => i.product_id);

    // Find products not in wishlist
    const suggestions = await Product.find({
      _id: { $nin: wishlistedIds }
    }).limit(6);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
