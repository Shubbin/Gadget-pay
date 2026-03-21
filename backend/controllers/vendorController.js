const { query } = require('../config/db');

exports.registerVendor = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await query(
      "UPDATE users SET role = 'vendor' WHERE id = $1 RETURNING *",
      [userId]
    );
    res.json({ message: 'Welcome to the Vendor Community!', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorProducts = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const { rows } = await query(
      'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
      [vendorId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorStats = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const { rows: products } = await query('SELECT COUNT(*) FROM products WHERE vendor_id = $1', [vendorId]);
    const { rows: orders } = await query(
      'SELECT COUNT(o.id) as total_sales, SUM(o.total_amount) as total_revenue FROM orders o JOIN products p ON o.product_id = p.id WHERE p.vendor_id = $1',
      [vendorId]
    );
    res.json({
      productCount: parseInt(products[0].count),
      totalSales: parseInt(orders[0].total_sales),
      totalRevenue: parseFloat(orders[0].total_revenue || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorSalesHistory = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const { rows } = await query(
      `SELECT DATE_TRUNC('day', o.created_at) as day, SUM(o.total_amount) as sales
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE p.vendor_id = $1
       GROUP BY day
       ORDER BY day ASC
       LIMIT 7`,
      [vendorId]
    );
    res.json(rows.map(r => ({ 
        name: new Date(r.day).toLocaleDateString('en-US', { weekday: 'short' }), 
        sales: parseFloat(r.sales) 
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
