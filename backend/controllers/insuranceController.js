const InsurancePlan = require('../models/InsurancePlan');

exports.getPlans = async (req, res) => {
  try {
    const plans = await InsurancePlan.find().sort({ monthly_premium: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
