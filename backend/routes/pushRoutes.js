const express = require('express');
const router = express.Router();
const { subscribe, broadcast } = require('../controllers/pushController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, subscribe);
router.post('/broadcast', protect, admin, broadcast);

module.exports = router;
