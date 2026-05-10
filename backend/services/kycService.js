const User = require('../models/User');
const KYCVerification = require('../models/KYCVerification');

/**
 * Simulates a call to an identity verification provider (e.g. Smile ID, Verified.ng)
 * @param {string} userId - The ID of the user undergoing verification
 * @param {object} kycData - Data including nin, bvn, and optional cac_number
 */
exports.simulateAutoVerification = async (userId, kycData) => {
  const { nin, bvn, cac_number } = kycData;

  console.log(`[KYC Service] Starting auto-verification for User ${userId}...`);

  // Simple format validation for the simulation
  const isNinValid = nin && nin.length === 11;
  const isBvnValid = bvn && bvn.length === 11;

  // Simulate network latency of an external API
  setTimeout(async () => {
    try {
      if (isNinValid && isBvnValid) {
        console.log(`[KYC Service] Verification SUCCESS for User ${userId}`);
        
        const user = await User.findById(userId);
        const tier = user?.tier || 'Bronze';
        
        // Define limits based on tier
        const limits = {
          'Bronze': 150000,
          'Silver': 500000,
          'Gold': 1500000,
          'Premium': 5000000
        };

        const creditLimit = limits[tier] || 150000;

        await User.findByIdAndUpdate(userId, {
          kyc_status: 'verified', 
          credit_limit: creditLimit, 
          risk_score: 30,
          nin: nin,
          bvn: bvn,
          cac_number: cac_number || null,
          cac_url: kycData.cac_url || null
        });

        // Update the kyc_verifications table record to 'verified'
        await KYCVerification.findOneAndUpdate(
          { user_id: userId, status: 'pending' },
          { status: 'verified' }
        );

      } else {
        console.log(`[KYC Service] Verification FAILED for User ${userId}`);
        await User.findByIdAndUpdate(userId, { kyc_status: 'rejected' });
        await KYCVerification.findOneAndUpdate(
          { user_id: userId, status: 'pending' },
          { status: 'rejected', admin_notes: 'NIN or BVN format invalid' }
        );
      }
    } catch (error) {
      console.error(`[KYC Service] Error during background verification for User ${userId}:`, error);
    }
  }, 5000); // 5 second delay for "Automation" feel
};
