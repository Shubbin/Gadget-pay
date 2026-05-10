const Referral = require('../models/Referral');
const User = require('../models/User');

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const referrals = await Referral.find({ referrer_id: userId })
      .populate('invitee_id', 'name email');

    const result = referrals.map(r => ({
      ...r.toObject(),
      invitee_name: r.invitee_id?.name,
      invitee_email: r.invitee_id?.email
    }));

    const rewardsEarned = referrals.filter(r => r.reward_claimed).length * 5000;

    res.json({
      referralCode: userId,
      referrals: result,
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
    const existing = await Referral.findOne({ invitee_id: inviteeId });
    if (existing) {
      return res.status(400).json({ error: "You have already been referred" });
    }

    const referral = new Referral({
      referrer_id: referrerId,
      invitee_id: inviteeId,
      status: 'pending'
    });
    await referral.save();

    res.json({ message: "Referral tracked. Reward will be allocated after your first payment." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAndAwardReferral = async (userId) => {
  try {
    // Check if this user was referred
    const referral = await Referral.findOne({ 
      invitee_id: userId, 
      status: 'pending', 
      reward_claimed: false 
    });

    if (!referral) return;

    // Award ₦5,000 to referrer's credit limit
    await User.findByIdAndUpdate(referral.referrer_id, {
      $inc: { credit_limit: 5000 }
    });

    // Update referral status
    referral.status = 'completed';
    referral.reward_claimed = true;
    await referral.save();

    console.log(`Referral reward awarded to ${referral.referrer_id} for user ${userId}`);
  } catch (error) {
    console.error('Referral Reward Error:', error);
  }
};
