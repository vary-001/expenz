// src/validators/authValidator.js
const validator = require('validator');

const validateRegister = (data) => {
  const errors = {};
  const { name, email, password } = data;

  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.trim().length > 60) {
    errors.name = 'Name cannot exceed 60 characters';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(email)) {
    errors.email = 'Please provide a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (password.length > 128) {
    errors.password = 'Password is too long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = {};
  const { email, password } = data;

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(email)) {
    errors.email = 'Please provide a valid email';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = { validateRegister, validateLogin };