const express = require('express');
const router = express.Router();
const { registerVendor, getVendorProducts, getVendorStats, getVendorSalesHistory } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

const isVendor = (req, res, next) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Vendor access required' });
  next();
};

router.post('/register', protect, registerVendor);
router.get('/products', protect, isVendor, getVendorProducts);
router.get('/stats', protect, isVendor, getVendorStats);
router.get('/sales-history', protect, isVendor, getVendorSalesHistory);
router.post('/withdraw', protect, isVendor, require('../controllers/vendorController').requestPayout);

module.exports = router;
