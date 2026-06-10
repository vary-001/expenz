// src/utils/apiResponse.js
/**
 * Standardized API response helpers
 */

const success = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    ...(data !== null && { data }),
  });
};

const error = (res, statusCode = 500, message = 'Server error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    ...(errors && { errors }),
  });
};

module.exports = { success, error };