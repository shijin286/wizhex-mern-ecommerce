const config = require('../config/env');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { isValidObjectId } = require('../utils/helpers');
const { round2, restoreStock, cancelOrderAtomically, releaseStaleOrders } = require('../utils/orderStock');
const {
  razorpayEnabled,
  createRazorpayOrder,
  verifyRazorpaySignature,
  paymentConfig,
  toMinorUnits,
} = require('../utils/payments');

function paymentPayload(order) {
  if (order.paymentMethod === 'razorpay') {
    return {
      provider: 'razorpay',
      keyId: config.razorpay.keyId,
      providerOrderId: order.payment.providerOrderId,
      amount: toMinorUnits(order.totalAmount),
      currency: order.currency,
    };
  }
  return { provider: 'simulated', isTest: true };
}

/** Loads an order the current user may see: their own, or any order for admins. */
async function findAccessibleOrder(req, { ownerOnly = false } = {}) {
  if (!isValidObjectId(req.params.id)) throw ApiError.notFound('Order not found');
  const order = await Order.findById(req.params.id);
  const isOwner = order && String(order.user) === String(req.user._id);
  const allowed = order && (isOwner || (!ownerOnly && req.user.role === 'admin'));
  // 404 (not 403) so other people's order ids can't be probed.
  if (!allowed) throw ApiError.notFound('Order not found');
  return order;
}

// GET /api/orders/payment-config
const getPaymentConfig = (_req, res) => res.json(paymentConfig());

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, contact, paymentMethod, idempotencyKey } = req.body;

  // Retried request (double click, network retry): return the order created the first time.
  const existing = await Order.findOne({ user: req.user._id, idempotencyKey });
  if (existing) return res.status(200).json({ order: existing, payment: paymentPayload(existing), duplicate: true });

  if (paymentMethod === 'razorpay' && !razorpayEnabled()) {
    throw ApiError.badRequest('Online payment is not available right now. Please choose another method.');
  }
  if (paymentMethod === 'simulated' && !config.allowSimulatedPayments) {
    throw ApiError.badRequest('Test payments are disabled on this store.');
  }

  await releaseStaleOrders();

  // Only product ids and quantities are taken from the client.
  const quantities = new Map();
  items.forEach(({ product, quantity }) => {
    quantities.set(String(product), (quantities.get(String(product)) || 0) + Number(quantity));
  });

  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, isActive: true }).populate('category', 'name');
  if (products.length !== quantities.size) {
    throw ApiError.conflict('Some items in your cart are no longer available. Please review your cart.');
  }

  // Reserve stock atomically: each decrement only succeeds if enough stock remains,
  // so two buyers can never both get the last account.
  const reserved = [];
  for (const product of products) {
    const quantity = quantities.get(String(product._id));
    // eslint-disable-next-line no-await-in-loop
    const ok = await Product.findOneAndUpdate(
      { _id: product._id, isActive: true, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
    );
    if (!ok) {
      // eslint-disable-next-line no-await-in-loop
      await restoreStock(reserved);
      throw ApiError.conflict(`"${product.name}" was just sold or has fewer than ${quantity} available.`);
    }
    reserved.push({ product: product._id, quantity });
  }

  // All prices come from the database.
  const orderItems = products.map((product) => ({
    product: product._id,
    name: product.name,
    image: product.images[0] || '',
    game: product.category?.name || product.brand,
    price: product.price,
    quantity: quantities.get(String(product._id)),
  }));
  const subtotal = round2(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = round2(config.deliveryFee);

  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      contact,
      currency: config.currency,
      subtotal,
      deliveryFee,
      totalAmount: round2(subtotal + deliveryFee),
      paymentMethod,
      payment: { provider: paymentMethod, isTest: paymentMethod === 'simulated' || config.razorpay.keyId.startsWith('rzp_test_') },
      idempotencyKey,
    });
  } catch (error) {
    await restoreStock(reserved);
    if (error.code === 11000) {
      const duplicate = await Order.findOne({ user: req.user._id, idempotencyKey });
      return res.status(200).json({ order: duplicate, payment: paymentPayload(duplicate), duplicate: true });
    }
    throw error;
  }

  if (paymentMethod === 'razorpay') {
    try {
      const providerOrder = await createRazorpayOrder({
        amount: order.totalAmount,
        currency: order.currency,
        receipt: String(order._id),
      });
      order.payment.providerOrderId = providerOrder.id;
      await order.save();
    } catch (error) {
      await cancelOrderAtomically(order._id, { fromStatuses: ['pending'] });
      throw error;
    }
  }

  // Ordered accounts leave the saved cart.
  await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: { $in: orderItems.map((i) => i.product) } } } });

  return res.status(201).json({ order, payment: paymentPayload(order) });
});

// POST /api/orders/:id/pay — confirms payment. Safe to call more than once.
const confirmPayment = asyncHandler(async (req, res) => {
  const order = await findAccessibleOrder(req, { ownerOnly: true });

  if (order.paymentStatus === 'paid') return res.json({ order });
  if (order.orderStatus === 'cancelled') {
    throw ApiError.conflict('This order was cancelled because it was not paid in time. Please place a new order.');
  }

  const update = { paymentStatus: 'paid', orderStatus: 'processing', 'payment.paidAt': new Date() };

  if (order.paymentMethod === 'simulated') {
    if (!config.allowSimulatedPayments) throw ApiError.badRequest('Test payments are disabled on this store.');
    if (req.body.outcome === 'failure') {
      await Order.updateOne({ _id: order._id, paymentStatus: { $ne: 'paid' } }, { paymentStatus: 'failed' });
      return res.status(402).json({
        success: false,
        message: 'The test payment failed. No money was taken — you can try again.',
        order: await Order.findById(order._id),
      });
    }
    update['payment.providerPaymentId'] = `SIM-${Date.now()}`;
  } else {
    const { razorpay_order_id: rzOrderId, razorpay_payment_id: rzPaymentId, razorpay_signature: signature } = req.body;
    const valid =
      rzOrderId === order.payment.providerOrderId &&
      verifyRazorpaySignature({ orderId: rzOrderId, paymentId: rzPaymentId, signature });
    if (!valid) throw ApiError.badRequest('Payment verification failed. If money was taken, contact support.');
    update['payment.providerPaymentId'] = rzPaymentId;
  }

  // Only one request can flip the order to "paid".
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: 'paid' }, orderStatus: { $ne: 'cancelled' } },
    { $set: update },
    { new: true },
  );
  if (!updated) return res.json({ order: await Order.findById(order._id) });

  await Promise.all(updated.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { soldCount: item.quantity } })));
  return res.json({ order: updated });
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  res.json({ order: await findAccessibleOrder(req) });
});

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findAccessibleOrder(req, { ownerOnly: true });
  const cancelled = await cancelOrderAtomically(order._id, { fromStatuses: ['pending', 'processing'] });
  if (!cancelled) throw ApiError.conflict(`This order is already ${order.orderStatus} and can't be cancelled.`);
  res.json({ order: cancelled });
});

module.exports = { getPaymentConfig, createOrder, confirmPayment, getMyOrders, getOrder, cancelOrder };
