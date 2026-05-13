const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, getProfile, updateProfile, activateCard } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/activate-card', protect, activateCard);

module.exports = router;
