const { query } = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.quantity, 
        json_build_object(
          'id', p.id, 'name', p.name, 'brand', p.brand, 
          'price', p.price, 'category', p.category, 
          'image_url', p.image_url
        ) as products
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    res.json(rows.map(item => ({ product: item.products, quantity: item.quantity })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = EXCLUDED.quantity 
       RETURNING *`,
      [req.user.id, productId, quantity]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Item not found in cart' });
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
