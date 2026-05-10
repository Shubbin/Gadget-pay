const axios = require('axios');
const User = require('../models/User');
const AutoDebitSubscription = require('../models/AutoDebitSubscription');

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
    const subscription = await AutoDebitSubscription.findOne({
      user_id: userId,
      installment_id: installmentId,
      status: 'active'
    });

    if (!subscription) return { success: false, error: 'No active auto-debit found' };

    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'User not found' };

    // 2. Charge card
    const response = await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        email: user.email,
        amount: amount * 100,
        authorization_code: subscription.authorization_code
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
