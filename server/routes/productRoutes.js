const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listReviews,
  createReview,
} = require('../controllers/productController');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();

router.get('/', optionalAuth, validate(rules.productQuery), listProducts);
router.get('/:id', optionalAuth, getProduct);

router.post('/', protect, requireAdmin, validate(rules.productBody(false)), createProduct);
router.put('/:id', protect, requireAdmin, validate([rules.mongoId(), ...rules.productBody(true)]), updateProduct);
router.delete('/:id', protect, requireAdmin, validate([rules.mongoId()]), deleteProduct);

router.get('/:id/reviews', listReviews);
router.post(
  '/:id/reviews',
  protect,
  validate([
    rules.mongoId(),
    rules.body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').toInt(),
    rules.body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be 10–1000 characters'),
  ]),
  createReview,
);

module.exports = router;
