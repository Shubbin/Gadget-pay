const Transaction = require('../models/Transaction');
const Installment = require('../models/Installment');
const AutoDebitSubscription = require('../models/AutoDebitSubscription');

exports.handlePaystackWebhook = async (req, res) => {
  const event = req.body;
  
  // In production, verify the Paystack signature here!
  
  console.log(`[Paystack Webhook] Received event: ${event.event}`);

  if (event.event === 'charge.success') {
    const { reference, amount, customer, authorization, metadata } = event.data;
    const installmentId = metadata?.installmentId;
    const userId = metadata?.userId;

    if (!installmentId) {
      console.error('[Paystack Webhook] No installmentId in metadata');
      return res.sendStatus(200); 
    }

    try {
      console.log(`[Paystack Webhook] Processing successful payment for Installment ${installmentId}`);

      // 1. Record the transaction with 48h escrow
      const settlementReadyAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      const transaction = new Transaction({
        installment_id: installmentId,
        amount: amount / 100,
        status: 'success',
        payment_reference: reference,
        is_settled_to_vendor: false,
        settlement_ready_at: settlementReadyAt
      });
      await transaction.save();

      // 2. Update installment balance and next date
      const inst = await Installment.findById(installmentId);
      
      if (inst) {
        const newBalance = Math.max(0, inst.remaining_balance - (amount / 100));
        
        let nextDate = null;
        if (newBalance > 0) {
          const currentDate = new Date(inst.next_payment_date || Date.now());
          if (inst.frequency === 'weekly') {
            nextDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
          } else if (inst.frequency === 'monthly') {
            nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
          } else {
            nextDate = new Date(currentDate.setDate(currentDate.getDate() + 1)); // daily
          }
        }

        inst.remaining_balance = newBalance;
        inst.next_payment_date = nextDate;
        inst.status = newBalance === 0 ? 'completed' : 'active';
        await inst.save();

        // 3. Store authorization for auto-debit if provided
        if (authorization && authorization.reusable) {
          await AutoDebitSubscription.findOneAndUpdate(
            { user_id: userId, last4: authorization.last4 },
            { 
              authorization_code: authorization.authorization_code,
              card_type: authorization.card_type,
              exp_month: authorization.exp_month,
              exp_year: authorization.exp_year,
              status: 'active'
            },
            { upsert: true }
          );
        }
      }

      console.log(`[Paystack Webhook] Successfully settled installment ${installmentId}`);
    } catch (error) {
      console.error('[Paystack Webhook] Error processing payment:', error);
    }
  }

  res.sendStatus(200);
};
