const express = require('express');
const router = express.Router();
const { getPlans } = require('../controllers/insuranceController');

router.get('/plans', getPlans);

module.exports = router;
