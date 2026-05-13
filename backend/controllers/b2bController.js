const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * B2B Controller
 * 
 * Logic for merchants/business owners to use GadgetFlex as an installment endpoint.
 */

// 1. Merchant API Key Management
exports.generateApiKey = async (req, res) => {
  const { name } = req.body;
  const merchantId = req.user.id;

  try {
    const apiKey = `gf_live_${crypto.randomBytes(24).toString('hex')}`;
    
    const { data, error } = await supabase
      .from('merchant_api_keys')
      .insert([{
        merchant_id: merchantId,
        api_key: apiKey,
        name: name || 'Default Key'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'API Key generated', apiKey: data.api_key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('merchant_api_keys')
      .select('*')
      .eq('merchant_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. B2B Checkout Session (Called by Third-Party via API Key)
exports.createCheckoutSession = async (req, res) => {
  const { productId, userId, amount, plan } = req.body;
  const merchantId = req.merchant.id; // From API Key middleware

  try {
    // Calculate commission (2.5% default for simulation)
    const commissionRate = 0.025; 
    const commission = amount * commissionRate;
    const merchantPayout = amount - commission;

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        product_id: productId,
        vendor_id: merchantId,
        amount: amount,
        platform_commission: commission,
        merchant_payout_amount: merchantPayout,
        plan: plan,
        is_b2b: true,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Checkout session created',
      orderId: order.id,
      checkoutUrl: `https://gadgetflex.com.ng/checkout/b2b/${order.id}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Merchant Analytics
exports.getMerchantStats = async (req, res) => {
  const merchantId = req.user.id;

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('amount, platform_commission, merchant_payout_amount, status')
      .eq('vendor_id', merchantId);

    if (error) throw error;

    const stats = orders.reduce((acc, o) => {
      acc.totalSales += 1;
      acc.totalVolume += Number(o.amount);
      acc.totalCommissionPaid += Number(o.platform_commission);
      acc.totalPayouts += Number(o.merchant_payout_amount);
      if (o.status === 'delivered') acc.completedSales += 1;
      return acc;
    }, {
      totalSales: 0,
      totalVolume: 0,
      totalCommissionPaid: 0,
      totalPayouts: 0,
      completedSales: 0
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
