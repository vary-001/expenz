// src/middleware/errorHandler.js
const env = require('../config/env');
const { error } = require('../utils/apiResponse');

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  return error(res, 404, 'Resource not found');
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err && err.statusCode ? err.statusCode : 500;
  const message = err && err.message ? err.message : 'Internal server error';

  if (env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      status: 'error',
      message,
      stack: err && err.stack,
    });
  }

  return error(res, statusCode, message);
};

module.exports = { notFound, errorHandler };