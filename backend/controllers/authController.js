const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserTier = require('../models/UserTier');
const { sendOTP } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // User model hashes password in pre-save hook
    const user = new User({
      name,
      email,
      password,
      otp_code: otp,
      otp_expires_at
    });

    await user.save();
    
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      email: user.email,
      otp: otp // TEMPORARY: Exposing for inspection
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp_code: otp,
      otp_expires_at: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.is_verified = true;
    user.otp_code = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    res.json({
      message: 'Account verified successfully',
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.findOneAndUpdate(
      { email, is_verified: false },
      { otp_code: otp, otp_expires_at },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    await sendOTP(email, otp);
    res.json({ 
      message: 'New OTP sent to your email',
      otp: otp 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('tier_id');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in', unverified: true });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier_id?.name || user.tier || 'Bronze',
      risk_score: user.risk_score,
      credit_limit: user.credit_limit,
      card_design: user.card_design,
      is_card_active: user.is_card_active,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  // req.user is already populated in protect middleware
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, card_design, is_card_active } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, card_design, is_card_active } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateCard = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { is_card_active: true } },
      { new: true }
    ).select('id name is_card_active');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
