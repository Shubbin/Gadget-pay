const { query } = require('../config/db');

exports.getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, search, vendor_id } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND category = $' + (params.length + 1);
    params.push(category);
  }
  if (minPrice) {
    sql += ' AND price >= $' + (params.length + 1);
    params.push(minPrice);
  }
  if (maxPrice) {
    sql += ' AND price <= $' + (params.length + 1);
    params.push(maxPrice);
  }
  if (search) {
    sql += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
    params.push(`%${search}%`);
  }
  if (vendor_id) {
    sql += ' AND vendor_id = $' + (params.length + 1);
    params.push(vendor_id);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    const product = rows[0];

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, brand, category, price, description, specs, image_url, inventory, tags, metadata } = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO products (name, brand, category, price, description, specs, image_url, inventory, tags, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, brand, category, price, description, specs, image_url, inventory, tags, metadata]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
  
  try {
    const { rows } = await query(
      `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
