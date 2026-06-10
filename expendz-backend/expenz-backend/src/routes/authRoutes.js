// src/routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');

const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

// Rate limit auth attempts to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // 20 requests per window
  message: {
    success: false,
    status: 'error',
    message: 'Too many auth requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(validateRegister), register);
router.post('/login', authLimiter, validate(validateLogin), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;