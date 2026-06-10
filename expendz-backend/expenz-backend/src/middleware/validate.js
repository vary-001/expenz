// src/middleware/validate.js
/**
 * Generic validation middleware
 * Accepts a validator function and runs it against req.body
 */

const validate = (validatorFn) => (req, res, next) => {
  const { isValid, errors } = validatorFn(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }
  next();
};

module.exports = validate;
// Support transpiled/ESM-style imports that may look for a `default` property
module.exports.default = validate;