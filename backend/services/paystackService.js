const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Charges a saved authorization for a user
 * @param {string} email - User email
 * @param {number} amount - Amount in kobo
 * @param {string} authorizationCode - The reusable auth code from Paystack
 * @param {object} metadata - Metadata to pass back to the webhook
 */
exports.chargeAuthorization = async (email, amount, authorizationCode, metadata) => {
  try {
    console.log(`[Paystack Service] Charging auth code ${authorizationCode} for ${email}...`);
    
    // In production, we'd call:
    // const response = await paystack.post('/transaction/charge_authorization', {
    //   email, amount, authorization_code: authorizationCode, metadata
    // });
    // return response.data;

    // FOR SIMULATION: We'll return a "success" response
    return {
      status: true,
      message: 'Charge attempted',
      data: {
        status: 'success',
        reference: `SIM_${Date.now()}`,
        amount: amount
      }
    };
  } catch (error) {
    console.error('[Paystack Service] Error charging authorization:', error.response?.data || error.message);
    throw error;
  }
};
