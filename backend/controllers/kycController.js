const KYCVerification = require('../models/KYCVerification');
const User = require('../models/User');
const { simulateAutoVerification } = require('../services/kycService');

exports.submitKYC = async (req, res) => {
  try {
    const { documentType, documentUrl, nin, bvn, cacNumber, cacUrl } = req.body;
    
    const verification = new KYCVerification({
      user_id: req.user.id,
      document_type: documentType,
      document_url: documentUrl,
      status: 'pending'
    });
    // Adding custom fields to document if they are provided (Mongoose Mixed type metadata if needed, or just add to schema)
    // For now keeping it simple as per schema I created
    await verification.save();

    // Start simulated auto-verification in background
    simulateAutoVerification(req.user.id, { nin, bvn, cac_number: cacNumber, cac_url: cacUrl });

    // Mark user status as pending immediately
    await User.findByIdAndUpdate(req.user.id, { kyc_status: 'pending' });
    
    res.status(201).json({ 
      message: 'KYC submitted and auto-verification started', 
      verification 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const verification = await KYCVerification.findOne({ user_id: req.user.id })
      .sort({ created_at: -1 });

    res.json(verification || { status: 'unverified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminReviewKYC = async (req, res) => {
  const { kycId, status, adminNotes, creditLimit } = req.body;
  try {
    const kyc = await KYCVerification.findByIdAndUpdate(
      kycId,
      { status, admin_notes: adminNotes },
      { new: true }
    );

    if (!kyc) throw new Error('Verification record not found');

    // If verified, update the user table
    if (status === 'verified') {
      await User.findByIdAndUpdate(kyc.user_id, {
        kyc_status: 'verified',
        credit_limit: creditLimit || 500000,
        risk_score: 20
      });
    } else {
      await User.findByIdAndUpdate(kyc.user_id, { kyc_status: 'rejected' });
    }

    res.json({ message: `KYC ${status}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
