const Order = require('../models/Order');
const Installment = require('../models/Installment');
const Product = require('../models/Product');
const settlementService = require('../services/SettlementService');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate('product_id')
      .sort({ created_at: -1 });

    const result = orders.map(o => ({
      ...o.toObject(),
      product_name: o.product_id?.name,
      image_url: o.product_id?.image_url
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const { productId, totalAmount, insuranceId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const order = new Order({
      user_id: req.user.id,
      product_id: productId,
      vendor_id: product.vendor_id,
      total_amount: totalAmount,
      insurance_id: insuranceId,
      status: 'pending'
    });
    
    await order.save();

    // Process financial split
    if (order.vendor_id) {
      await settlementService.processOrderCommission(order._id);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const counts = await Order.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const installments = await Installment.find()
      .populate({
        path: 'order_id',
        match: { user_id: req.user.id }
      });

    const totalBalance = installments
      .filter(i => i.order_id != null)
      .reduce((sum, i) => sum + (i.remaining_balance || 0), 0);

    res.json({
      counts: counts.map(c => ({ status: c._id, count: c.count })),
      totalBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
