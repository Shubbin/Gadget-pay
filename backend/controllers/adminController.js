const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Installment = require('../models/Installment');

exports.getAnalytics = async (req, res) => {
  try {
    const [userCount, orderCount, revenueSum] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      totalRevenue: revenueSum[0]?.total || 0,
      activePlans: orderCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [users, orders, revenue, installments, debt, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } }
      ]),
      Installment.countDocuments(),
      Installment.aggregate([
        { $group: { _id: null, total: { $sum: "$remaining_balance" } } }
      ]),
      Order.find().populate('product_id').sort({ created_at: -1 }).limit(10)
    ]);

    res.json({
      userCount: users,
      orderCount: orders,
      revenue: revenue[0]?.total || 0,
      installmentCount: installments,
      outstandingDebt: debt[0]?.total || 0,
      recentOrders: recentOrders.map(o => ({
        ...o.toObject(),
        product_name: o.product_id?.name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('id name email role created_at');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
