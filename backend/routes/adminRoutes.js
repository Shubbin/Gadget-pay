const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, getDashboard, runReminders } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getUsers);
router.post('/reminders/run', protect, admin, runReminders);

module.exports = router;
