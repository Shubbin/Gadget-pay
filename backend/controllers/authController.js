const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * GadgetFlex Auth Controller
 */

// 1. Request Email OTP (Login/Signup)
exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) throw error;
    res.json({ message: 'OTP sent! Please check your email for the 6-digit code.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Verify Email OTP
exports.verifyOtp = async (req, res) => {
  const { email, token, name } = req.body; // 'name' may be passed during signup
  if (!email || !token) return res.status(400).json({ error: 'Email and code are required' });

  try {
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (authError) throw authError;

    // Check if user profile exists in public.users
    let { data: user, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !user) {
      // Create profile for new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name: name || authData.user.user_metadata?.name || 'User',
            email,
            role: 'user',
            tier: 'Bronze',
            is_verified: true
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    res.json({
      message: 'Login successful',
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier || 'Bronze',
        risk_score: user.risk_score,
        credit_limit: user.credit_limit,
        is_card_active: user.is_card_active
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired code' });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, card_design, is_card_active } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, card_design, is_card_active })
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateCard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_card_active: true })
      .eq('id', req.user.id)
      .select('id, name, is_card_active')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://gadgetflex.vercel.app';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`
    });
    if (error) throw error;
    res.json({ message: 'Reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Password
exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
