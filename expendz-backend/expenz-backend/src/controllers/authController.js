// src/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return error(res, 409, 'An account with this email already exists');
    }

    // Create user (password hashed via pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return success(res, 201, 'Account created successfully', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return error(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return error(res, 403, 'Your account has been deactivated');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 401, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return success(res, 200, 'Login successful', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return success(res, 200, 'User fetched successfully', {
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout (client-side token disposal — server acknowledges)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currency, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) return error(res, 404, 'User not found');

    // Password change
    if (newPassword) {
      if (!currentPassword) return error(res, 400, 'Current password is required');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return error(res, 401, 'Current password is incorrect');

      if (newPassword.length < 6) {
        return error(res, 400, 'New password must be at least 6 characters');
      }

      user.password = newPassword;
    }

    // Profile fields
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (currency) user.currency = currency.toUpperCase();

    await user.save();

    return success(res, 200, 'Profile updated successfully', {
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout, updateProfile };