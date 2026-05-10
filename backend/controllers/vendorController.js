const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const flutterwaveService = require('../services/FlutterwaveService');

exports.registerVendor = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findByIdAndUpdate(userId, { role: 'vendor' }, { new: true });
    res.json({ message: 'Welcome to the Vendor Community!', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorProducts = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const products = await Product.find({ vendor_id: vendorId }).sort({ created_at: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorStats = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const [user, productCount, orders] = await Promise.all([
      User.findById(vendorId),
      Product.countDocuments({ vendor_id: vendorId }),
      Order.aggregate([
        { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$vendor_payout_amount" }
          }
        }
      ])
    ]);

    res.json({
      productCount,
      totalSales: orders[0]?.totalSales || 0,
      totalRevenue: orders[0]?.totalRevenue || 0,
      escrowBalance: user?.settled_payout_balance || 0, // Available for withdrawal
      pendingPayout: user?.pending_payout_balance || 0 // In escrow/hold
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorSalesHistory = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const history = await Order.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          sales: { $sum: "$vendor_payout_amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    res.json(history.map(r => ({ 
        name: new Date(r._id).toLocaleDateString('en-US', { weekday: 'short' }), 
        sales: r.sales 
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestPayout = async (req, res) => {
  const vendorId = req.user.id;
  const { amount } = req.body;

  try {
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') return res.status(403).json({ error: 'Access denied' });

    if (amount > vendor.settled_payout_balance) {
      return res.status(400).json({ error: 'Insufficient settled balance' });
    }

    if (!vendor.bank_details?.account_number || !vendor.bank_details?.bank_name) {
      return res.status(400).json({ error: 'Bank details not configured' });
    }

    // Initiate Transfer via Flutterwave
    const payout = await flutterwaveService.initiateTransfer({
      account_bank: vendor.bank_details.bank_name, 
      account_number: vendor.bank_details.account_number,
      amount: amount,
      narration: `GadgetFlex Payout for ${vendor.name}`
    });

    if (payout.status === 'success') {
      // Deduct balance
      vendor.settled_payout_balance -= amount;
      await vendor.save();

      // Log transaction
      await Transaction.create({
        user_id: vendorId,
        amount: amount,
        type: 'payout',
        status: 'completed',
        metadata: { flutterwave_ref: payout.data.reference }
      });

      res.json({ message: 'Payout initiated successfully', data: payout.data });
    } else {
      res.status(400).json({ error: 'Payout initiation failed', details: payout.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
