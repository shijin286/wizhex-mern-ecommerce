const express = require('express');
const { health, subscribe, contact } = require('../controllers/miscController');
const { formLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

router.get('/health', health);
router.post('/newsletter', formLimiter, validate([rules.email()]), subscribe);
router.post(
  '/contact',
  formLimiter,
  validate([
    rules.name(),
    rules.email(),
    rules.body('subject').trim().isLength({ min: 2, max: 100 }).withMessage('Please choose a subject'),
    rules.body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters'),
  ]),
  contact,
);

module.exports = router;
