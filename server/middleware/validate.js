const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs a list of express-validator chains, then responds 422 with
 * `{ message, errors: { field: message } }` if any of them failed.
 */
const validate = (chains) => [
  ...chains,
  (req, _res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = {};
    result.array().forEach((error) => {
      const field = error.path || error.param || 'input';
      if (!errors[field]) errors[field] = error.msg;
    });
    const first = Object.values(errors)[0];
    return next(new ApiError(422, first || 'Please check your input', errors));
  },
];

module.exports = validate;
