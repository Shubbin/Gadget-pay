const { query } = require('../config/db');

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: referrals } = await query(
      `SELECT r.*, u.name as invitee_name, u.email as invitee_email 
       FROM referrals r 
       JOIN users u ON r.invitee_id = u.id 
       WHERE r.referrer_id = $1`,
      [userId]
    );

    const rewardsEarned = referrals.filter(r => r.reward_claimed).length * 5000;

    res.json({
      referralCode: userId, // Using UUID as code for simplicity
      referrals,
      rewardsEarned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.trackReferral = async (req, res) => {
  const { referrerId } = req.body;
  const inviteeId = req.user.id;

  try {
    if (referrerId === inviteeId) {
      return res.status(400).json({ error: "You cannot refer yourself" });
    }

    // Check if already referred
    const { rows: existing } = await query('SELECT * FROM referrals WHERE invitee_id = $1', [inviteeId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already been referred" });
    }

    await query(
      'INSERT INTO referrals (referrer_id, invitee_id, status) VALUES ($1, $2, $3)',
      [referrerId, inviteeId, 'pending']
    );

    res.json({ message: "Referral tracked. Reward will be allocated after your first payment." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAndAwardReferral = async (userId) => {
  try {
    // Check if this user was referred
    const { rows: referrals } = await query(
      'SELECT * FROM referrals WHERE invitee_id = $1 AND status = $2 AND reward_claimed = false',
      [userId, 'pending']
    );

    if (referrals.length === 0) return;

    const referral = referrals[0];

    // Award ₦5,000 to referrer's credit limit or wallet (let's increase credit limit)
    await query(
      'UPDATE users SET credit_limit = credit_limit + 5000 WHERE id = $1',
      [referral.referrer_id]
    );

    // Update referral status
    await query(
      'UPDATE referrals SET status = $1, reward_claimed = $2 WHERE id = $3',
      ['completed', true, referral.id]
    );

    console.log(`Referral reward awarded to ${referral.referrer_id} for user ${userId}`);
  } catch (error) {
    console.error('Referral Reward Error:', error);
  }
};
