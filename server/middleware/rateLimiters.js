const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const common = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Rate limiting would make the automated tests flaky.
  skip: () => config.isTest,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({ success: false, message: options.message });
  },
};

const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 500,
  message: 'Too many requests. Please slow down and try again shortly.',
});

// Slows down password guessing.
const authLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many login attempts. Please wait 15 minutes and try again.',
});

const formLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many submissions. Please try again later.',
});

module.exports = { apiLimiter, authLimiter, formLimiter };
