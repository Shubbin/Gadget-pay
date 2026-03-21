const { query } = require('../config/db');

exports.getOrders = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.*, p.name as product_name, p.image_url 
       FROM orders o 
       JOIN products p ON o.product_id = p.id 
       WHERE o.user_id = $1 
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const { productId, totalAmount, insuranceId } = req.body;
  try {
    const { rows } = await query(
      'INSERT INTO orders (user_id, product_id, total_amount, insurance_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, productId, totalAmount, insuranceId, 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const { rows: counts } = await query(
      "SELECT status, COUNT(*) FROM orders WHERE user_id = $1 GROUP BY status",
      [req.user.id]
    );
    const { rows: balance } = await query(
      "SELECT SUM(remaining_balance) as total_debt FROM installments i JOIN orders o ON i.order_id = o.id WHERE o.user_id = $1",
      [req.user.id]
    );
    res.json({
      counts,
      totalBalance: parseFloat(balance[0].total_debt || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
