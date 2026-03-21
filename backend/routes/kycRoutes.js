const express = require('express');
const router = express.Router();
const { submitKYC, getKYCStatus, adminReviewKYC } = require('../controllers/kycController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/submit', submitKYC);
router.get('/status', getKYCStatus);
router.post('/review', admin, adminReviewKYC);

module.exports = router;
