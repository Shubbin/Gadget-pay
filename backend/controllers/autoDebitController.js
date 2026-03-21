const axios = require('axios');
const { query } = require('../config/db');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

exports.initializeAutoDebit = async (req, res) => {
  const { installmentId, email, amount } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        callback_url: `${process.env.FRONTEND_URL}/dashboard/installments/${installmentId}?autodebit=true`,
        metadata: {
          installmentId,
          userId: req.user.id,
          type: 'auto_debit_setup'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.chargeSavedCard = async (userId, installmentId, amount) => {
  try {
    // 1. Get auth code
    const { rows: auths } = await query(
      'SELECT paystack_auth_code FROM auto_debit_subscriptions WHERE user_id = $1 AND installment_id = $2 AND status = $3',
      [userId, installmentId, 'active']
    );

    if (auths.length === 0) return { success: false, error: 'No active auto-debit found' };

    const authCode = auths[0].paystack_auth_code;
    const { rows: userRows } = await query('SELECT email FROM users WHERE id = $1', [userId]);
    const email = userRows[0].email;

    // 2. Charge card
    const response = await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email,
        amount: amount * 100,
        authorization_code: authCode
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.data.status === 'success') {
      return { success: true, reference: response.data.data.reference };
    } else {
      return { success: false, error: response.data.data.gateway_response };
    }
  } catch (error) {
    console.error('Auto-Debit Charge Error:', error);
    return { success: false, error: error.message };
  }
};
