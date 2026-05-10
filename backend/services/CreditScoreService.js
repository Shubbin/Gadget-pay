/**
 * CreditScoreService
 * 
 * Logic to calculate user risk_score (0-100)
 * Higher score = Lower risk = Better terms
 */

const User = require('../models/User');
const Order = require('../models/Order');
const Installment = require('../models/Installment');

class CreditScoreService {
  /**
   * Calculate and update a user's risk score
   * @param {string} userId 
   */
  async calculateScore(userId) {
    const user = await User.findById(userId);
    if (!user) return 0;

    let score = 30; // Base score for new users

    // 1. Profile Completeness (+20 points)
    if (user.is_verified) score += 5;
    if (user.nin) score += 5;
    if (user.bvn) score += 10;

    // 2. Payment History (+50 points)
    const installments = await Installment.find({ user_id: userId });
    if (installments.length > 0) {
      const totalPayments = installments.length;
      const onTimePayments = installments.filter(i => i.status === 'completed' && !i.is_overdue).length;
      const overduePayments = installments.filter(i => i.is_overdue).length;

      const paymentRatio = onTimePayments / totalPayments;
      score += Math.round(paymentRatio * 40);

      // Penalties for overdue
      score -= (overduePayments * 10);
    }

    // 3. Loyalty (+10 points)
    const orders = await Order.find({ user_id: userId, status: 'completed' });
    score += Math.min(orders.length * 2, 10);

    // Bounds check
    score = Math.max(0, Math.min(100, score));

    // Update user
    user.risk_score = score;
    
    // Auto-update tier based on score
    if (score >= 90) user.tier = 'Platinum';
    else if (score >= 75) user.tier = 'Gold';
    else if (score >= 50) user.tier = 'Silver';
    else user.tier = 'Bronze';

    await user.save();
    return score;
  }
}

module.exports = new CreditScoreService();
