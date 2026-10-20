const config = require('../config/env');
const ApiError = require('../utils/ApiError');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors && err instanceof ApiError ? err.errors : undefined;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    message = Object.values(errors)[0] || 'Validation failed';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field === 'email' ? 'An account with this email already exists' : `That ${field || 'value'} is already in use`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  if (statusCode >= 500) {
    if (!config.isTest) console.error('[error]', err);
    // Never leak internal error details in production.
    if (config.isProduction) message = 'Something went wrong. Please try again later.';
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (!config.isProduction && statusCode >= 500) body.stack = err.stack;
  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
