const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).populate('tier_id');

      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // Format user object to match expected structure in controllers
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc_status: user.kyc_status,
        risk_score: user.risk_score,
        credit_limit: user.credit_limit,
        tier_name: user.tier_id?.name || user.tier || 'Bronze',
        interest_discount: user.tier_id?.interest_discount || user.interest_discount || 0
      };
      
      next();
    } catch (error) {
      console.error('Auth Error:', error);
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
