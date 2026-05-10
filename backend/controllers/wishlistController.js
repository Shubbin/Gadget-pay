const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user_id: req.user.id }).populate('product_id');
    const result = items.map(i => i.product_id).filter(p => p != null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findOneAndUpdate(
      { user_id: req.user.id, product_id: req.body.productId },
      { user_id: req.user.id, product_id: req.body.productId },
      { upsert: true, new: true }
    );
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({ 
      user_id: req.user.id, 
      product_id: req.params.productId 
    });

    if (!result) return res.status(404).json({ error: 'Item not found in wishlist' });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
