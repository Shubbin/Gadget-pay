const supabase = require('../config/supabase');

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

      // 1. Record the transaction
      const { data: transaction, error: tError } = await supabase
        .from('transactions')
        .insert([
          {
            installment_id: installmentId,
            user_id: userId,
            amount: amount / 100,
            status: 'success',
            reference: reference,
            type: 'payment',
            payment_gateway: 'paystack'
          }
        ]);

      if (tError) throw tError;

      // 2. Update installment balance and next date
      const { data: inst, error: fetchError } = await supabase
        .from('installments')
        .select('*')
        .eq('id', installmentId)
        .single();
      
      if (inst) {
        const newBalance = Math.max(0, Number(inst.remaining_balance) - (amount / 100));
        
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

        const { error: updateError } = await supabase
          .from('installments')
          .update({
            remaining_balance: newBalance,
            next_payment_date: nextDate ? nextDate.toISOString() : null,
            status: newBalance === 0 ? 'completed' : 'active'
          })
          .eq('id', installmentId);

        if (updateError) throw updateError;
      }

      console.log(`[Paystack Webhook] Successfully settled installment ${installmentId}`);
    } catch (error) {
      console.error('[Paystack Webhook] Error processing payment:', error);
    }
  }

  res.sendStatus(200);
};
