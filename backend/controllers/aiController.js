const supabase = require('../config/supabase');

exports.getRecommendations = async (req, res) => {
  const { productId } = req.params;
  try {
    const { data: targetProduct, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (pError || !targetProduct) throw new Error('Product not found');

    // Simple Recommendation: Same category or overlapping tags
    // Supabase filtering for tags (array) uses 'overlaps'
    const { data: recommendations, error: rError } = await supabase
      .from('products')
      .select('*')
      .neq('id', productId)
      .or(`category.eq.${targetProduct.category},tags.ov.{${(targetProduct.tags || []).join(',')}}`)
      .limit(4);

    if (rError) throw rError;

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPersonalizedSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get products already in wishlist
    const { data: wishlistedItems } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    const wishlistedIds = (wishlistedItems || []).map(i => i.product_id);

    // Find products not in wishlist
    let query = supabase.from('products').select('*');
    if (wishlistedIds.length > 0) {
      query = query.not('id', 'in', `(${wishlistedIds.join(',')})`);
    }

    const { data: suggestions, error: sError } = await query.limit(6);

    if (sError) throw sError;

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
