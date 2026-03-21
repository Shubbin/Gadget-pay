const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { rows } = await query(
        `SELECT u.id, u.name, u.email, u.role, u.kyc_status, u.risk_score, u.credit_limit, 
                t.name as tier_name, t.interest_discount
         FROM users u
         LEFT JOIN user_tiers t ON u.tier_id = t.id
         WHERE u.id = $1`,
        [decoded.id]
      );
      const user = rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};
