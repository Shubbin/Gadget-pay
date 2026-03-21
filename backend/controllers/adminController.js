const { query } = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const { rows: userCount } = await query('SELECT COUNT(*) as count FROM users');
    const { rows: orderCount } = await query('SELECT COUNT(*) as count FROM orders');
    const { rows: revenueSum } = await query('SELECT SUM(amount) as total FROM transactions WHERE status = $1', ['success']);

    res.json({
      totalUsers: parseInt(userCount[0].count),
      totalOrders: parseInt(orderCount[0].count),
      totalRevenue: parseFloat(revenueSum[0].total || 0),
      activePlans: parseInt(orderCount[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { rows: users } = await query('SELECT COUNT(*) FROM users');
    const { rows: orders } = await query('SELECT COUNT(*) FROM orders');
    const { rows: revenue } = await query('SELECT SUM(total_amount) FROM orders WHERE status = $1', ['completed']);
    const { rows: installments } = await query('SELECT COUNT(*) FROM installments');
    const { rows: debt } = await query('SELECT SUM(remaining_balance) FROM installments');
    const { rows: recentOrders } = await query(`
      SELECT o.*, p.name as product_name 
      FROM orders o 
      LEFT JOIN products p ON o.product_id = p.id 
      ORDER BY o.created_at DESC 
      LIMIT 10
    `);

    res.json({
      userCount: parseInt(users[0].count),
      orderCount: parseInt(orders[0].count),
      revenue: parseFloat(revenue[0].sum || 0),
      installmentCount: parseInt(installments[0].count),
      outstandingDebt: parseFloat(debt[0].sum || 0),
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { rows } = await query('SELECT id, name, email, role, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
