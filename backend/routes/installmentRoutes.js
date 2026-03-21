const express = require('express');
const router = express.Router();
const { createPlan, getSchedule, getUserInstallments } = require('../controllers/installmentController');
const { initializeAutoDebit } = require('../controllers/autoDebitController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createPlan);
router.get('/:planId', protect, getSchedule);
router.get('/', protect, getUserInstallments);
router.post('/auto-debit', protect, initializeAutoDebit);

module.exports = router;
