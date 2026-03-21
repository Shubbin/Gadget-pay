const express = require('express');
const router = express.Router();
const { getDetailedAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/detailed', getDetailedAnalytics);

module.exports = router;
