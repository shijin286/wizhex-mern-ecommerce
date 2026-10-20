const express = require('express');
const {
  getPaymentConfig,
  createOrder,
  confirmPayment,
  getMyOrders,
  getOrder,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();
const { body } = rules;

router.get('/payment-config', getPaymentConfig);

router.use(protect);

router.post(
  '/',
  validate([
    body('items').isArray({ min: 1, max: 50 }).withMessage('Your cart is empty'),
    body('items.*.product').isMongoId().withMessage('Invalid product id'),
    body('items.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1–10').toInt(),
    body('contact').isObject().withMessage('Contact details are required'),
    body('contact.fullName').trim().isLength({ min: 2, max: 80 }).withMessage('Please enter your full name'),
    body('contact.email').trim().toLowerCase().isEmail().withMessage('Enter a valid email address'),
    body('contact.phone').trim().matches(/^\+?[0-9\s-]{7,20}$/).withMessage('Enter a valid phone number'),
    body('contact.country').trim().isLength({ min: 2, max: 60 }).withMessage('Please enter your country'),
    body('contact.preferredContact').optional().isIn(['email', 'whatsapp']),
    body('contact.notes').optional().trim().isLength({ max: 500 }),
    body('paymentMethod').isIn(['razorpay', 'simulated']).withMessage('Choose a payment method'),
    body('idempotencyKey')
      .isString()
      .matches(/^[A-Za-z0-9-]{8,100}$/)
      .withMessage('Missing or invalid idempotency key'),
  ]),
  createOrder,
);

router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);
router.post(
  '/:id/pay',
  validate([
    rules.mongoId(),
    body('outcome').optional().isIn(['success', 'failure']),
    body('razorpay_order_id').optional().isString().isLength({ max: 100 }),
    body('razorpay_payment_id').optional().isString().isLength({ max: 100 }),
    body('razorpay_signature').optional().isString().isLength({ max: 200 }),
  ]),
  confirmPayment,
);
router.post('/:id/cancel', validate([rules.mongoId()]), cancelOrder);

module.exports = router;
