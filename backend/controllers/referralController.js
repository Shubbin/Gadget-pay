const supabase = require('../config/supabase');

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*, users:invitee_id(name, email)')
      .eq('referrer_id', userId);

    if (error) throw error;

    const result = (referrals || []).map(r => ({
      ...r,
      invitee_name: r.users?.name,
      invitee_email: r.users?.email
    }));

    const rewardsEarned = (referrals || []).filter(r => r.reward_claimed).length * 5000;

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
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('invitee_id', inviteeId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "You have already been referred" });
    }

    const { error: insertError } = await supabase
      .from('referrals')
      .insert([
        {
          referrer_id: referrerId,
          invitee_id: inviteeId,
          status: 'pending'
        }
      ]);

    if (insertError) throw insertError;

    res.json({ message: "Referral tracked. Reward will be allocated after your first payment." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAndAwardReferral = async (userId) => {
  try {
    // Check if this user was referred
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('invitee_id', userId)
      .eq('status', 'pending')
      .eq('reward_claimed', false)
      .single();

    if (error || !referral) return;

    // Award ₦5,000 to referrer's credit limit
    const { data: referrer } = await supabase.from('users').select('credit_limit').eq('id', referral.referrer_id).single();
    const newLimit = (referrer?.credit_limit || 0) + 5000;
    
    await supabase.from('users').update({ credit_limit: newLimit }).eq('id', referral.referrer_id);

    // Update referral status
    await supabase
      .from('referrals')
      .update({ status: 'completed', reward_claimed: true })
      .eq('id', referral.id);

    console.log(`Referral reward awarded to ${referral.referrer_id} for user ${userId}`);
  } catch (error) {
    console.error('Referral Reward Error:', error.message);
  }
};
