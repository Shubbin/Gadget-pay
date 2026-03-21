const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getOrderStats } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.get('/stats', protect, getOrderStats);

module.exports = router;
