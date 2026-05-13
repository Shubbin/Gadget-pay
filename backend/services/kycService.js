const supabase = require('../config/supabase');
const aiService = require('./aiService');

/**
 * Simulates and automates KYC verification using AI
 * @param {string} userId - The ID of the user undergoing verification
 * @param {object} kycData - Data including nin, bvn, and optional cac_number
 */
exports.simulateAutoVerification = async (userId, kycData) => {
  const { nin, bvn, cac_number } = kycData;

  console.log(`[KYC Service] Starting AI-assisted verification for User ${userId}...`);

  try {
    // 1. Fetch User Profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new Error('User not found');

    // 2. Get AI Analysis
    const aiAnalysis = await aiService.analyzeKYC({ name: user.name, nin, bvn });
    console.log(`[KYC Service] AI Recommendation: ${aiAnalysis.recommendation}`);

    // 3. Process based on AI Recommendation
    if (aiAnalysis.recommendation === 'approve' || (aiAnalysis.recommendation === 'manual_review' && aiAnalysis.risk_level === 'low')) {
      const tier = user.tier || 'Bronze';
      
      const limits = {
        'Bronze': 150000,
        'Silver': 500000,
        'Gold': 1500000,
        'Platinum': 5000000
      };

      const creditLimit = limits[tier] || 150000;

      await supabase
        .from('users')
        .update({
          kyc_status: 'verified', 
          credit_limit: creditLimit, 
          risk_score: 30, // Starting score
          nin: nin,
          bvn: bvn,
          cac_number: cac_number || null,
          is_verified: true
        })
        .eq('id', userId);

      // Record coaching log
      await supabase.from('ai_coaching_logs').insert([{
        user_id: userId,
        advice_type: 'kyc',
        advice_content: `Verification successful! Your starting credit limit is ₦${creditLimit.toLocaleString()}. Tip: Pay your installments early to gain more points!`,
        risk_score_at_time: 30
      }]);

      // Update the kyc_verifications table
      await supabase
        .from('kyc_verifications')
        .update({ status: 'verified' })
        .eq('user_id', userId)
        .eq('status', 'pending');

    } else {
      await supabase
        .from('users')
        .update({ kyc_status: aiAnalysis.recommendation === 'reject' ? 'rejected' : 'pending' })
        .eq('id', userId);
        
      await supabase
        .from('kyc_verifications')
        .update({ 
          status: aiAnalysis.recommendation === 'reject' ? 'rejected' : 'pending',
          admin_notes: aiAnalysis.reason 
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      console.warn(`[KYC Service] Verification ${aiAnalysis.recommendation} for User ${userId}: ${aiAnalysis.reason}`);
    }
  } catch (error) {
    console.error(`[KYC Service] Error during AI verification for User ${userId}:`, error.message);
  }
};
