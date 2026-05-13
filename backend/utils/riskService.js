const supabase = require('../config/supabase');

/**
 * Recalculates a user's risk score and credit limit based on their repayment history
 * @param {string} userId - The ID of the user to score
 */
const calculateRiskScore = async (userId) => {
  try {
    // 1. Fetch user's data
    const { data: user, error: uError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (uError || !user) return;

    // If not verified, they stay at base risk
    if (user.kyc_status !== 'verified') return;

    // 2. Fetch user's transactions via installments
    const { data: transactions, error: tError } = await supabase
      .from('transactions')
      .select('*, installments!inner(order_id)')
      .eq('user_id', userId);

    if (tError) throw tError;

    const good_pays = transactions.filter(t => t.status === 'success').length;
    const bad_pays = transactions.filter(t => t.status === 'failed').length;
    const total_repaid = transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
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

    // 4. Tier Determination (Simplified logic for now, or match CreditScoreService)
    let tierName = 'Bronze';
    let multiplier = 1.0;

    if (newScore <= 30) {
      tierName = 'Platinum';
      multiplier = 2.0;
    } else if (newScore <= 60) {
      tierName = 'Gold';
      multiplier = 1.5;
    } else if (newScore <= 90) {
      tierName = 'Silver';
      multiplier = 1.2;
    }

    // Dynamic Credit Limit adjustment (Reward successful repayments)
    if (total_repaid > 0) {
      newLimit = (500000 * multiplier) + (total_repaid * 0.1);
    } else {
      newLimit = 500000 * multiplier;
    }

    // 5. Update the DB
    await supabase
      .from('users')
      .update({
        risk_score: newScore,
        credit_limit: newLimit,
        tier: tierName
      })
      .eq('id', userId);

    return { newScore, newLimit, tier: tierName };
  } catch (error) {
    console.error(`Risk Scoring Error for user ${userId}:`, error.message);
  }
};

module.exports = { calculateRiskScore };
