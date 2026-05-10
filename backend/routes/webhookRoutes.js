const express = require('express');
const router = express.Router();
const { handlePaystackWebhook } = require('../controllers/webhookController');

// Paystack sends webhooks as a POST request
// Note: This route should NOT have auth middleware as it comes from Paystack
router.post('/paystack', handlePaystackWebhook);

module.exports = router;
