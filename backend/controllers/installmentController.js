const { query } = require('../config/db');

const calculateInstallments = (price, duration, frequency, interestDiscount = 0, insurancePremium = 0) => {
  const baseRate = 0.05; // 5% flat
  const effectiveRate = Math.max(0, baseRate - (interestDiscount / 100));
  
  const priceWithInterest = price * (1 + effectiveRate * (duration / 12));
  const totalWithInsurance = priceWithInterest + (insurancePremium * duration);
  
  let divisor;
  switch (frequency) {
    case 'daily': divisor = duration * 30; break;
    case 'weekly': divisor = duration * 4; break;
    case 'monthly': divisor = duration; break;
    default: divisor = duration;
  }

  const installmentAmount = Math.ceil(totalWithInsurance / divisor);
  const totalPayable = installmentAmount * divisor;

  return { installmentAmount, totalPayable, periods: divisor };
};

exports.createPlan = async (req, res) => {
  const { productId, duration, frequency, insuranceId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get product, user tier, and insurance info
    const [prodRes, userRes, insRes] = await Promise.all([
      query('SELECT price FROM products WHERE id = $1', [productId]),
      query(`
        SELECT u.tier_id, t.interest_discount 
        FROM users u 
        LEFT JOIN user_tiers t ON u.tier_id = t.id 
        WHERE u.id = $1`, [userId]),
      insuranceId ? query('SELECT monthly_premium FROM insurance_plans WHERE id = $1', [insuranceId]) : { rows: [] }
    ]);

    if (prodRes.rows.length === 0) throw new Error('Product not found');
    
    const product = prodRes.rows[0];
    const user = userRes.rows[0];
    const insurance = insRes.rows[0] || { monthly_premium: 0 };

    // 2. Calculate plan
    const { installmentAmount, totalPayable, periods } = calculateInstallments(
      product.price, 
      duration, 
      frequency, 
      user?.interest_discount || 0,
      parseFloat(insurance.monthly_premium)
    );

    // 3. Create Order
    const { rows: orderRows } = await query(
      'INSERT INTO orders (user_id, status, total_amount, insurance_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, 'pending', totalPayable, insuranceId || null, productId]
    );
    const order = orderRows[0];

    // 4. Create Installment Plan
    const { rows: planRows } = await query(
      `INSERT INTO installments (order_id, total_installments, frequency, remaining_balance, next_payment_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order.id, periods, frequency, totalPayable, new Date(Date.now() + 86400000)]
    );
    const plan = planRows[0];

    res.status(201).json({ order, plan, installmentAmount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  const { planId } = req.params;
  try {
    const { rows } = await query(
      `SELECT i.*, 
        json_build_object(
          'id', o.id, 
          'status', o.status, 
          'total_amount', o.total_amount, 
          'created_at', o.created_at
        ) as orders
       FROM installments i
       JOIN orders o ON i.order_id = o.id
       WHERE i.id = $1`,
      [planId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInstallments = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT i.*, p.name as product_name, p.image_url, o.total_amount as order_total, o.created_at as order_date,
              CASE WHEN ads.id IS NOT NULL AND ads.status = 'active' THEN true ELSE false END as auto_debit_active
       FROM installments i
       JOIN orders o ON i.order_id = o.id
       JOIN products p ON o.product_id = p.id
       LEFT JOIN auto_debit_subscriptions ads ON i.id = ads.installment_id
       WHERE o.user_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
