// Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}` });
    }
    
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Moderator middleware
const isModerator = (req, res, next) => {
  if (!req.user || (!req.user.isAdmin && !req.user.isModerator)) {
    return res.status(403).json({ error: 'Moderator access required' });
  }
  next();
};

module.exports = { auth, isAdmin, isModerator };
