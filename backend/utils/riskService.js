const { query } = require('../config/db');

/**
 * Recalculates a user's risk score and credit limit based on their repayment history
 * @param {string} userId - The ID of the user to score
 */
const calculateRiskScore = async (userId) => {
  try {
    // 1. Fetch user's repayment history
    const { rows: userRows } = await query('SELECT role, kyc_status, risk_score, credit_limit FROM users WHERE id = $1', [userId]);
    if (userRows.length === 0) return;
    const user = userRows[0];

    // If not verified, they stay at base risk
    if (user.kyc_status !== 'verified') return;

    // 2. Count successful and failed transactions
    const { rows: stats } = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE t.status = 'success') as good_pays,
        COUNT(*) FILTER (WHERE t.status = 'failed') as bad_pays,
        SUM(t.amount) FILTER (WHERE t.status = 'success') as total_repaid
      FROM transactions t
      JOIN installments i ON t.installment_id = i.id
      JOIN orders o ON i.order_id = o.id
      WHERE o.user_id = $1
    `, [userId]);

    const { good_pays, bad_pays, total_repaid } = stats[0];
    
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
    const { rows: tiers } = await query(
      'SELECT id, name, credit_multiplier FROM user_tiers WHERE $1 BETWEEN min_score AND max_score',
      [newScore]
    );
    const tier = tiers[0] || { id: 1, name: 'Bronze', credit_multiplier: 1.0 };

    // Dynamic Credit Limit adjustment (Reward successful repayments)
    if (total_repaid > 0) {
      // Base limit * tier multiplier + 10% of total repaid
      newLimit = (500000 * parseFloat(tier.credit_multiplier)) + (total_repaid * 0.1);
    }

    // 5. Update the DB
    await query(
      'UPDATE users SET risk_score = $1, credit_limit = $2, tier_id = $3 WHERE id = $4',
      [newScore, newLimit, tier.id, userId]
    );

    return { newScore, newLimit, tier: tier.name };
  } catch (error) {
    console.error(`Risk Scoring Error for user ${userId}:`, error);
  }
};

module.exports = { calculateRiskScore };
