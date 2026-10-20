const express = require('express');
const { getStats, listOrders, updateOrderStatus, listUsers } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../middleware/rules');

const router = express.Router();
const { body, query } = rules;

// Every admin route checks the user's role from the database.
router.use(protect, requireAdmin);

router.get('/stats', getStats);

router.get(
  '/orders',
  validate([
    query('status').optional().isIn(['pending', 'processing', 'delivered', 'cancelled']),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  listOrders,
);

router.patch(
  '/orders/:id/status',
  validate([
    rules.mongoId(),
    body('status').isIn(['delivered', 'cancelled']).withMessage('Status must be "delivered" or "cancelled"'),
  ]),
  updateOrderStatus,
);

router.get(
  '/users',
  validate([
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ]),
  listUsers,
);

module.exports = router;
