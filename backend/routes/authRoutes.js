const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, verifyOTP, resendOTP, activateCard } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/activate-card', protect, activateCard);

module.exports = router;
