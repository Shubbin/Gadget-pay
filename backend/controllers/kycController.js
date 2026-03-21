const { query } = require('../config/db');

exports.submitKYC = async (req, res) => {
  try {
    const { documentType, documentUrl } = req.body;
    const { rows } = await query(
      `INSERT INTO kyc_verifications (user_id, document_type, document_url, status) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, documentType, documentUrl, 'pending']
    );

    // Update user status
    await query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['pending', req.user.id]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM kyc_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );

    res.json(rows[0] || { status: 'unverified' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.adminReviewKYC = async (req, res) => {
  const { kycId, status, adminNotes, creditLimit } = req.body;
  try {
    const { rows } = await query(
      'UPDATE kyc_verifications SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING user_id',
      [status, adminNotes, kycId]
    );

    if (rows.length === 0) throw new Error('Verification record not found');
    const kyc = rows[0];

    // If verified, update the user table
    if (status === 'verified') {
      await query(
        `UPDATE users SET 
          kyc_status = $1, 
          credit_limit = $2, 
          risk_score = $3 
         WHERE id = $4`,
        ['verified', creditLimit || 500000, 20, kyc.user_id]
      );
    } else {
      await query('UPDATE users SET kyc_status = $1 WHERE id = $2', ['rejected', kyc.user_id]);
    }

    res.json({ message: `KYC ${status}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
