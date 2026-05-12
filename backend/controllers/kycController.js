const supabase = require('../config/supabase');

exports.submitKYC = async (req, res) => {
  try {
    const { documentType, documentUrl, nin, bvn, cacNumber, cacUrl } = req.body;
    
    // In our Supabase schema, KYC data is stored directly in the users table or a separate table.
    // For now, let's update the users table directly as per your schema.
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        kyc_status: 'pending',
        nin,
        bvn,
        cac_number: cacNumber,
        cac_url: cacUrl
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Simulate auto-verification (requires kycService migration if used)
    // simulateAutoVerification(req.user.id, { nin, bvn, cac_number: cacNumber, cac_url: cacUrl });
    
    res.status(201).json({ 
      message: 'KYC submitted and auto-verification started', 
      user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('kyc_status, nin, bvn')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ status: user.kyc_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminReviewKYC = async (req, res) => {
  const { userId, status, creditLimit } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        kyc_status: status,
        credit_limit: status === 'verified' ? (creditLimit || 500000) : 0,
        risk_score: status === 'verified' ? 20 : 0
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: `KYC ${status}`, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
