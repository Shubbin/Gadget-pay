const CartItem = require('../models/CartItem');

exports.getCart = async (req, res) => {
  try {
    const items = await CartItem.find({ user_id: req.user.id }).populate('product_id');
    const result = items.map(item => ({
      product: item.product_id,
      quantity: item.quantity
    })).filter(i => i.product != null);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const item = await CartItem.findOneAndUpdate(
      { user_id: req.user.id, product_id: productId },
      { quantity },
      { upsert: true, new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const result = await CartItem.findOneAndDelete({ 
      user_id: req.user.id, 
      product_id: req.params.productId 
    });

    if (!result) return res.status(404).json({ error: 'Item not found in cart' });
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
