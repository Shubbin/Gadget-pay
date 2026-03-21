const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { sendOTP } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { rows } = await query(
      'INSERT INTO users (name, email, password, otp_code, otp_expires_at) VALUES ($1, $2, $3, $4, NOW() + interval \'10 minutes\') RETURNING id, name, email, role',
      [name, email, hashedPassword, otp]
    );

    const user = rows[0];
    
    // Send OTP via SendGrid (Now Brevo Mocked)
    await sendOTP(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      email: user.email,
      otp: otp // TEMPORARY: Exposing for inspection as requested
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1 AND otp_code = $2 AND otp_expires_at > NOW()',
      [email, otp]
    );

    if (rows.length === 0) {
      console.log('OTP invalid or expired (DB side check)');
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await query(
      'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE email = $1',
      [email]
    );

    const user = rows[0];
    res.json({
      message: 'Account verified successfully',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { rowCount } = await query(
      'UPDATE users SET otp_code = $1, otp_expires_at = NOW() + interval \'10 minutes\' WHERE email = $2 AND is_verified = FALSE',
      [otp, email]
    );

    if (rowCount === 0) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    await sendOTP(email, otp);
    res.json({ 
      message: 'New OTP sent to your email',
      otp: otp // TEMPORARY: Exposing for inspection as requested
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await query(
      `SELECT u.*, t.name as tier_name 
       FROM users u 
       LEFT JOIN user_tiers t ON u.tier_id = t.id 
       WHERE u.email = $1`,
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in', unverified: true });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier_name || 'Bronze',
      risk_score: user.risk_score,
      credit_limit: user.credit_limit,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
      [name, req.user.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
