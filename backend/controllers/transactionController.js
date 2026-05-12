const supabase = require('../config/supabase');

exports.getHistory = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        installments:installment_id (
          *,
          orders:order_id (*)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference, installmentId, amount } = req.body;
  
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: req.user.id,
          installment_id: installmentId,
          amount,
          status: 'success',
          reference,
          type: 'payment'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // TODO: Update risk score and check referral (requires riskService migration)
    // await calculateRiskScore(req.user.id);
    // await checkAndAwardReferral(req.user.id);

    res.json({ message: 'Payment verified and updated', transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCards = async (req, res) => {
  // Assuming cards are stored in a payment_methods or similar table if implemented
  res.json([]); 
};
