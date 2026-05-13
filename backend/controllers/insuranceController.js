const supabase = require('../config/supabase');

exports.getPlans = async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('insurance_plans')
      .select('*')
      .order('monthly_premium', { ascending: true });

    if (error) throw error;
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
