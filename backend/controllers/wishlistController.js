const { query } = require('../config/db');

exports.getWishlist = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.* 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { rows } = await query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [req.user.id, req.body.productId]
    );

    res.status(201).json(rows[0] || { message: 'Already in wishlist' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Item not found in wishlist' });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
