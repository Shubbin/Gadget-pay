const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getOrderStats, requestDeliveryCode, confirmDelivery } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.get('/stats', protect, getOrderStats);
router.post('/request-delivery-code', protect, requestDeliveryCode);
router.post('/confirm-delivery', protect, confirmDelivery);

module.exports = router;
