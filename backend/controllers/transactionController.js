const Transaction = require('../models/Transaction');
const Installment = require('../models/Installment');
const AutoDebitSubscription = require('../models/AutoDebitSubscription');
const { calculateRiskScore } = require('../utils/riskService');
const { checkAndAwardReferral } = require('./referralController');

exports.getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: 'installment_id',
        populate: { path: 'order_id' }
      });

    // Filter by user_id
    const filtered = transactions.filter(t => t.installment_id?.order_id?.user_id?.toString() === req.user.id.toString());

    const result = filtered.map(t => {
      const obj = t.toObject();
      if (obj.installment_id) {
        obj.installments = obj.installment_id;
        if (obj.installments.order_id) {
            obj.installments.order = obj.installments.order_id;
            delete obj.installments.order_id;
        }
        delete obj.installment_id;
      }
      return obj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { reference, installmentId, amount } = req.body;
  
  try {
    const transaction = new Transaction({
      installment_id: installmentId,
      amount,
      status: 'success',
      payment_reference: reference
    });
    await transaction.save();

    // Update risk score and check referral
    await calculateRiskScore(req.user.id);
    await checkAndAwardReferral(req.user.id);

    res.json({ message: 'Payment verified and updated', transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCards = async (req, res) => {
  try {
    const cards = await AutoDebitSubscription.find({ user_id: req.user.id })
      .select('card_type last4 exp_month exp_year');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
