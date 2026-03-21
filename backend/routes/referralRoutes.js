const express = require('express');
const router = express.Router();
const { getReferralStats, trackReferral } = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getReferralStats);
router.post('/track', protect, trackReferral);

module.exports = router;
