const { query } = require('../config/db');

exports.getHistory = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT t.*, 
        json_build_object(
          'id', i.id, 'frequency', i.frequency,
          'order', json_build_object('id', o.id, 'total_amount', o.total_amount)
        ) as installments
       FROM transactions t
       JOIN installments i ON t.installment_id = i.id
       JOIN orders o ON i.order_id = o.id
       WHERE o.user_id = $1`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference, installmentId, amount } = req.body;
  
  try {
    const { rows: txRows } = await query(
      `INSERT INTO transactions (installment_id, amount, status, payment_reference) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [installmentId, amount, 'success', reference]
    );
    const transaction = txRows[0];

    // Update installment balance
    const { calculateRiskScore } = require('../utils/riskService');
    const { checkAndAwardReferral } = require('./referralController');
    
    await calculateRiskScore(req.user.id);
    await checkAndAwardReferral(req.user.id);

    res.json({ message: 'Payment verified and updated', transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, card_type, last4, exp_month, exp_year FROM auto_debit_subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
