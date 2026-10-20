const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

router.post('/register', authLimiter, validate([rules.name(), rules.email(), rules.newPassword()]), register);

router.post(
  '/login',
  authLimiter,
  validate([rules.email(), rules.body('password').isString().notEmpty().withMessage('Password is required')]),
  login,
);

router.get('/me', protect, getMe);

module.exports = router;
