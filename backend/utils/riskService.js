const User = require('../models/User');
const Transaction = require('../models/Transaction');
const UserTier = require('../models/UserTier');

/**
 * Recalculates a user's risk score and credit limit based on their repayment history
 * @param {string} userId - The ID of the user to score
 */
const calculateRiskScore = async (userId) => {
  try {
    // 1. Fetch user's repayment history
    const user = await User.findById(userId);
    if (!user) return;

    // If not verified, they stay at base risk
    if (user.kyc_status !== 'verified') return;

    // 2. Count successful and failed transactions
    const transactions = await Transaction.find()
      .populate({
        path: 'installment_id',
        populate: { path: 'order_id' }
      });

    const userTxs = transactions.filter(t => t.installment_id?.order_id?.user_id?.toString() === userId.toString());

    const good_pays = userTxs.filter(t => t.status === 'success').length;
    const bad_pays = userTxs.filter(t => t.status === 'failed').length;
    const total_repaid = userTxs
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // 3. Scoring Logic
    let newScore = parseInt(user.risk_score || 50); // Starting point
    let newLimit = parseFloat(user.credit_limit || 500000);

    // Reward good behavior
    if (good_pays > 0) {
      newScore -= (good_pays * 2); // Lower is better
    }

    // Penalize failures
    if (bad_pays > 0) {
      newScore += (bad_pays * 10);
    }

    // Limit score range (0 is perfect, 100 is max risk)
    newScore = Math.max(0, Math.min(100, newScore));

    // 4. Tier Determination
    const tier = await UserTier.findOne({
      min_score: { $lte: newScore },
      max_score: { $gte: newScore }
    }) || await UserTier.findOne({ name: 'Bronze' });

    const credit_multiplier = tier?.credit_multiplier || 1.0;

    // Dynamic Credit Limit adjustment (Reward successful repayments)
    if (total_repaid > 0) {
      // Base limit * tier multiplier + 10% of total repaid
      newLimit = (500000 * parseFloat(credit_multiplier)) + (total_repaid * 0.1);
    }

    // 5. Update the DB
    await User.findByIdAndUpdate(userId, {
      risk_score: newScore,
      credit_limit: newLimit,
      tier_id: tier?._id,
      tier: tier?.name
    });

    return { newScore, newLimit, tier: tier?.name };
  } catch (error) {
    console.error(`Risk Scoring Error for user ${userId}:`, error);
  }
};

module.exports = { calculateRiskScore };
