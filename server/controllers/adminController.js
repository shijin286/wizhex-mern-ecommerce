const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, isValidObjectId, parsePagination } = require('../utils/helpers');
const { cancelOrderAtomically, releaseStaleOrders } = require('../utils/orderStock');

// Allowed order status changes. Delivery is only possible once the order is paid.
const TRANSITIONS = {
  pending: ['cancelled'],
  processing: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// GET /api/admin/stats
const getStats = asyncHandler(async (_req, res) => {
  await releaseStaleOrders();

  // Days are bucketed in UTC, matching MongoDB's $dateToString.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  const [products, soldOut, orders, users, revenueAgg, toDeliver, recentOrders, sales] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.countDocuments({ orderStatus: 'processing' }),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', 'payment.paidAt': { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
    ]),
  ]);

  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(since);
    day.setUTCDate(since.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    const found = sales.find((s) => s._id === key);
    return { date: key, revenue: found ? Math.round(found.revenue * 100) / 100 : 0, orders: found ? found.orders : 0 };
  });

  res.json({
    stats: {
      products,
      soldOut,
      orders,
      users,
      revenue: Math.round((revenueAgg[0]?.total || 0) * 100) / 100,
      toDeliver,
    },
    recentOrders,
    salesByDay,
  });
});

// GET /api/admin/orders?status&paymentStatus&search&page&limit
const listOrders = asyncHandler(async (req, res) => {
  await releaseStaleOrders();
  const { status, paymentStatus, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });

  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    const term = escapeRegex(String(search).trim().slice(0, 100));
    filter.$or = [
      { 'contact.email': { $regex: term, $options: 'i' } },
      { 'contact.fullName': { $regex: term, $options: 'i' } },
      { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: term, options: 'i' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Order not found');
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (!TRANSITIONS[order.orderStatus].includes(status)) {
    throw ApiError.badRequest(`An order that is "${order.orderStatus}" can't be changed to "${status}".`);
  }

  let updated;
  if (status === 'cancelled') {
    updated = await cancelOrderAtomically(order._id, { fromStatuses: [order.orderStatus] });
  } else {
    // delivered
    updated = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: 'processing', paymentStatus: 'paid' },
      { $set: { orderStatus: 'delivered', deliveredAt: new Date() } },
      { new: true },
    );
  }
  if (!updated) throw ApiError.conflict('The order changed in the meantime. Please refresh and try again.');

  await updated.populate('user', 'name email');
  res.json({ order: updated });
});

// GET /api/admin/users?search&page&limit
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.search) {
    const pattern = new RegExp(escapeRegex(String(req.query.search).trim().slice(0, 100)), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const stats = await Order.aggregate([
    { $match: { user: { $in: users.map((u) => u._id) } } },
    {
      $group: {
        _id: '$user',
        orders: { $sum: 1 },
        spent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
      },
    },
  ]);
  const statsById = new Map(stats.map((s) => [String(s._id), s]));

  res.json({
    users: users.map(({ passwordHash, __v, addresses, ...user }) => ({
      ...user,
      orderCount: statsById.get(String(user._id))?.orders || 0,
      totalSpent: Math.round((statsById.get(String(user._id))?.spent || 0) * 100) / 100,
    })),
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
  });
});

module.exports = { getStats, listOrders, updateOrderStatus, listUsers, TRANSITIONS };
