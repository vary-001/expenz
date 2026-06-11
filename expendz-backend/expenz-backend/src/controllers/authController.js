// src/controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return error(res, 409, 'An account with this email already exists');

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return success(res, 201, 'Account created successfully', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) return error(res, 401, 'Invalid email or password');
    if (!user.isActive) return error(res, 403, 'Your account has been deactivated');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 401, 'Invalid email or password');

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    return success(res, 200, 'Login successful', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return success(res, 200, 'User fetched successfully', {
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    return success(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Update name, email, currency (legacy)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return error(res, 404, 'User not found');

    if (newPassword) {
      if (!currentPassword) return error(res, 400, 'Current password is required');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return error(res, 401, 'Current password is incorrect');
      if (newPassword.length < 6) return error(res, 400, 'New password must be at least 6 characters');
      user.password = newPassword;
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();

    await user.save();
    return success(res, 200, 'Profile updated successfully', { user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

/**
 * NEW: PUT /api/auth/preferences
 * Update currency, language, theme
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { currency, language, theme } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 404, 'User not found');

    if (currency) {
      if (!['USD', 'RWF'].includes(currency)) return error(res, 400, 'Invalid currency');
      user.preferences.currency = currency;
    }
    if (language) {
      if (!['en', 'kiny'].includes(language)) return error(res, 400, 'Invalid language');
      user.preferences.language = language;
    }
    if (theme) {
      if (!['light', 'dark'].includes(theme)) return error(res, 400, 'Invalid theme');
      user.preferences.theme = theme;
    }

    await user.save();
    return success(res, 200, 'Preferences updated', { user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

/**
 * NEW: POST /api/auth/complete-onboarding
 * Mark user as onboarded and save initial preferences
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const { currency, language, theme } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return error(res, 404, 'User not found');

    if (currency) user.preferences.currency = currency;
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;
    user.onboarded = true;

    await user.save();
    return success(res, 200, 'Onboarding completed', { user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updatePreferences,
  completeOnboarding,
};