const supabase = require('../config/supabase');
const settlementService = require('../services/SettlementService');

exports.getOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, products:product_id(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = orders.map(o => ({
      ...o,
      product_name: o.products?.name,
      image_url: o.products?.image_url
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const { productId, totalAmount, insuranceId } = req.body;
  try {
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (pError || !product) return res.status(404).json({ error: 'Product not found' });

    const { data: order, error: oError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: req.user.id,
          product_id: productId,
          amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid'
        }
      ])
      .select()
      .single();
    
    if (oError) throw oError;

    // Process financial split if vendor exists
    if (product.vendor_id) {
      await settlementService.processOrderCommission(order.id);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    // 1. Get counts by status
    const { data: orders, error: oError } = await supabase
      .from('orders')
      .select('status')
      .eq('user_id', req.user.id);

    if (oError) throw oError;

    const countsMap = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const counts = Object.entries(countsMap).map(([status, count]) => ({ status, count }));

    // 2. Get total balance from installments
    const { data: installments, error: iError } = await supabase
      .from('installments')
      .select('remaining_balance')
      .eq('user_id', req.user.id);

    if (iError) throw iError;

    const totalBalance = installments.reduce((sum, i) => sum + (Number(i.remaining_balance) || 0), 0);

    res.json({
      counts,
      totalBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
