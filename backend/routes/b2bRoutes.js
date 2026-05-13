const express = require('express');
const router = express.Router();
const b2bController = require('../controllers/b2bController');
const { protect, merchantApiKey } = require('../middleware/authMiddleware');

// Internal merchant routes (Requires user to be logged in)
router.post('/keys', protect, b2bController.generateApiKey);
router.get('/keys', protect, b2bController.getApiKeys);
router.get('/stats', protect, b2bController.getMerchantStats);

// Public B2B API (Requires API Key)
router.post('/checkout/session', merchantApiKey, b2bController.createCheckoutSession);

module.exports = router;
