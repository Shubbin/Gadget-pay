const supabase = require('../config/supabase');
const { sendOTP } = require('../services/emailService');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) throw authError;

    // Create profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: 'user',
          tier: 'Bronze',
          is_verified: false // Supabase handles email verification if enabled, but we follow your flow
        }
      ]);

    if (profileError) throw profileError;

    res.status(201).json({
      message: 'Registration successful. Please verify your email via the link sent.',
      email: email,
      id: authData.user.id
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  // Supabase Auth usually uses email links or OTPs internally.
  // For your custom flow, we'll assume the user clicked a link or we manually verify.
  res.json({ message: 'Supabase manages verification via email links by default.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Fetch user profile
    const { data: user, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier || 'Bronze',
      risk_score: user.risk_score,
      credit_limit: user.credit_limit,
      card_design: user.card_design,
      is_card_active: user.is_card_active,
      token: authData.session.access_token,
      refresh_token: authData.session.refresh_token
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid email or password' });
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
