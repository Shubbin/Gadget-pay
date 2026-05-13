const supabase = require('../config/supabase');

exports.getWishlist = async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('wishlist')
      .select('*, products:product_id(*)')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const result = items.map(i => i.products).filter(p => p != null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('wishlist')
      .upsert({ user_id: req.user.id, product_id: req.body.productId }, { onConflict: 'user_id,product_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.productId);

    if (error) throw error;
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
