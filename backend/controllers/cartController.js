const supabase = require('../config/supabase');

exports.getCart = async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('quantity, product:product_id(*)')
      .eq('user_id', req.user.id);

    if (error) throw error;
    
    // Flatten the product data to match previous response format
    const result = items.map(item => ({
      product: item.product,
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
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({ 
        user_id: req.user.id, 
        product_id: productId, 
        quantity 
      }, { onConflict: 'user_id, product_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .match({ 
        user_id: req.user.id, 
        product_id: req.params.productId 
      });

    if (error) throw error;
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
