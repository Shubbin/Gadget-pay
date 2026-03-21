const express = require('express');
const router = express.Router();
const { handlePaystack, handleFlutterwave } = require('../controllers/webhookController');

// Paystack sends webhooks as POST
router.post('/paystack', handlePaystack);
router.post('/flutterwave', handleFlutterwave);

module.exports = router;
