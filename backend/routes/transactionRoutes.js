const express = require('express');
const router = express.Router();
const { getHistory, verifyPayment, getCards } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getHistory);
router.get('/cards', protect, getCards);
router.post('/verify', protect, verifyPayment);

module.exports = router;
