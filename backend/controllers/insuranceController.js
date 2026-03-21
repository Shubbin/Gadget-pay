const { query } = require('../config/db');

exports.getPlans = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM insurance_plans ORDER BY monthly_premium ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
