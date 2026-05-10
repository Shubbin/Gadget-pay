const User = require('../models/User');
const Order = require('../models/Order');
const Installment = require('../models/Installment');

exports.getDetailedAnalytics = async (req, res) => {
  try {
    // 1. Revenue & Outstanding Balance
    const installments = await Installment.find().populate('order_id');

    const totalPortfolio = installments.reduce((sum, item) => sum + Number(item.order_id?.total_amount || 0), 0);
    const outstandingDebt = installments.reduce((sum, item) => sum + Number(item.remaining_balance || 0), 0);
    const recoveredRevenue = totalPortfolio - outstandingDebt;

    // 2. Plan Popularity
    const plans = await Installment.aggregate([
      { $group: { _id: "$frequency", value: { $sum: 1 } } }
    ]);

    // 3. User Risk Distribution
    const riskDist = await User.find({ risk_score: { $ne: null } }).select('risk_score');

    res.json({
      financials: { totalPortfolio, outstandingDebt, recoveredRevenue },
      riskDistribution: riskDist,
      plans: plans.map(p => ({ name: p._id, value: p.value }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGrowthData = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$created_at" },
          sales: { $sum: "$total_amount" },
          date: { $min: "$created_at" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const installments = await Installment.aggregate([
      {
        $group: {
          _id: { $month: "$created_at" },
          active: { $sum: 1 },
          date: { $min: "$created_at" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    res.json({ 
      sales: sales.map(s => ({ month: monthNames[s._id], sales: s.sales })), 
      installments: installments.map(i => ({ month: monthNames[i._id], active: i.active })) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
