const { query } = require('../config/db');

exports.getRecommendations = async (req, res) => {
  const { productId } = req.params;
  try {
    // 1. Try to find products users bought together (correlation)
    const { rows: correlations } = await query(
      `SELECT p.*, COUNT(*) as correlation_count
       FROM orders o1
       JOIN orders o2 ON o1.user_id = o2.user_id AND o1.product_id != o2.product_id
       JOIN products p ON o2.product_id = p.id
       WHERE o1.product_id = $1
       GROUP BY p.id
       ORDER BY correlation_count DESC
       LIMIT 4`,
      [productId]
    );

    if (correlations.length > 0) {
      return res.json(correlations);
    }

    // 2. Fallback: Tag/Category overlap
    const { rows: targetRows } = await query('SELECT tags, category FROM products WHERE id = $1', [productId]);
    if (targetRows.length === 0) throw new Error('Product not found');
    const targetProduct = targetRows[0];

    const { rows: recommendations } = await query(
      `SELECT * FROM products 
       WHERE id != $1 AND (tags && $2 OR category = $3) 
       LIMIT 4`,
      [productId, targetProduct.tags || [], targetProduct.category]
    );

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPersonalizedSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    // Logic: Find products not in user's wishlist
    const { rows: suggestions } = await query(
      `SELECT * FROM products 
       WHERE id NOT IN (SELECT product_id FROM wishlist WHERE user_id = $1) 
       LIMIT 6`,
      [userId]
    );

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
