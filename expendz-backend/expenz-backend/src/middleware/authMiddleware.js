// src/middleware/authMiddleware.js
const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const { error } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return error(res, 401, 'Not authorized. No token provided.');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return error(res, 401, 'Invalid or expired token. Please log in again.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 401, 'User no longer exists.');
    }

    if (!user.isActive) {
      return error(res, 403, 'Account is deactivated.');
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Authentication failed.');
  }
};

module.exports = { protect };