const supabase = require('../config/supabase');
const aiService = require('./aiService');

/**
 * CreditScoreService
 * 
 * Logic to calculate user risk_score (0-100) and provide AI coaching
 */
class CreditScoreService {
  /**
   * Calculate and update a user's risk score
   * @param {string} userId 
   */
  async calculateScore(userId) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) return 0;

      let score = 30; // Base score for new users

      // 1. Profile Completeness (+20 points)
      if (user.is_verified) score += 5;
      if (user.nin) score += 5;
      if (user.bvn) score += 10;

      // 2. Payment History (+50 points)
      const { data: installments, error: instError } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', userId);

      if (!instError && installments && installments.length > 0) {
        const totalPayments = installments.length;
        const onTimePayments = installments.filter(i => i.status === 'completed').length;
        const overduePayments = installments.filter(i => i.status === 'overdue').length;

        const paymentRatio = onTimePayments / totalPayments;
        score += Math.round(paymentRatio * 40);

        // Penalties for overdue
        score -= (overduePayments * 10);
      }

      // 3. Loyalty (+10 points)
      const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'delivered');

      if (!orderError) {
        score += Math.min(orderCount * 2, 10);
      }

      // Bounds check
      score = Math.max(0, Math.min(100, score));

      // 4. Update user
      let tier = 'Bronze';
      if (score >= 90) tier = 'Platinum';
      else if (score >= 75) tier = 'Gold';
      else if (score >= 50) tier = 'Silver';

      await supabase
        .from('users')
        .update({ 
          risk_score: score,
          tier: tier
        })
        .eq('id', userId);

      // 5. AI Coaching
      const coaching = await aiService.getCreditCoaching({
        name: user.name,
        risk_score: score,
        tier: tier,
        paymentHistory: installments || []
      });

      // Save coaching log
      await supabase.from('ai_coaching_logs').insert([{
        user_id: userId,
        advice_type: 'credit_score',
        advice_content: coaching.summary + " " + coaching.tips.join(" "),
        risk_score_at_time: score
      }]);

      return score;
    } catch (error) {
      console.error('Error calculating score:', error);
      return 0;
    }
  }
}

module.exports = new CreditScoreService();
