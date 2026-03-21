const { query } = require('../config/db');
const crypto = require('crypto');

exports.handlePaystack = async (req, res) => {
  // 1. Verify Signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];
  
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  
  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const { reference, amount, metadata, authorization } = event.data;
    const installmentId = metadata.installmentId; // Ensure correct case from initialization
    const userId = metadata.userId;

    try {
      // 2. Log successful transaction
      await query(
        `INSERT INTO transactions (installment_id, amount, status, payment_reference) 
         VALUES ($1, $2, $3, $4)`,
        [installmentId, amount / 100, 'success', reference]
      );

      // 3. Update installment balance
      await query(
        'UPDATE installments SET remaining_balance = GREATEST(0, remaining_balance - $1) WHERE id = $2',
        [amount / 100, installmentId]
      );

      // 4. Handle Auto-Debit Setup
      if (metadata.type === 'auto_debit_setup' && authorization?.reusable) {
        await query(
          `INSERT INTO auto_debit_subscriptions (user_id, installment_id, paystack_auth_code) 
           VALUES ($1, $2, $3)
           ON CONFLICT (installment_id) DO UPDATE SET paystack_auth_code = $3, status = 'active'`,
          [userId, installmentId, authorization.authorization_code]
        );
        console.log(`Auto-debit active for installment ${installmentId}`);
      }

      console.log(`Payment confirmed for installment ${installmentId}`);
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  res.status(200).send('OK');
};

exports.handleFlutterwave = async (req, res) => {
  // Similar logic for Flutterwave
  res.status(200).send('OK');
};
