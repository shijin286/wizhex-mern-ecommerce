const express = require('express');
const { getCart, replaceCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.put(
  '/',
  validate([
    rules.body('items').isArray({ max: 50 }).withMessage('items must be a list of up to 50 entries'),
    rules.body('items.*.product').isMongoId().withMessage('Invalid product id'),
    rules.body('items.*.quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be 1–99').toInt(),
  ]),
  replaceCart,
);

module.exports = router;
