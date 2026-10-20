const config = require('../config/env');
const Order = require('../models/Order');
const Product = require('../models/Product');

const round2 = (n) => Math.round(n * 100) / 100;

/** Puts reserved stock back (and undoes the sale count if the order had been paid). */
async function restoreStock(items, { wasPaid = false } = {}) {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, ...(wasPaid ? { soldCount: -item.quantity } : {}) } },
      ),
    ),
  );
}

/**
 * Atomically cancels an order if it is still in one of `fromStatuses`,
 * restoring its stock exactly once. Returns the updated order or null.
 */
async function cancelOrderAtomically(orderId, { fromStatuses = ['pending', 'processing'], extraFilter = {} } = {}) {
  const before = await Order.findOneAndUpdate(
    { _id: orderId, orderStatus: { $in: fromStatuses }, ...extraFilter },
    { $set: { orderStatus: 'cancelled', cancelledAt: new Date() } },
    { new: false },
  );
  if (!before) return null;

  const wasPaid = before.paymentStatus === 'paid';
  await restoreStock(before.items, { wasPaid });
  // Simulated/test payments are "refunded" instantly; real refunds go through the provider dashboard.
  if (wasPaid) await Order.updateOne({ _id: orderId }, { paymentStatus: 'refunded' });
  return Order.findById(orderId);
}

/** Cancels unpaid orders older than the reservation window so their accounts go back on sale. */
async function releaseStaleOrders() {
  const cutoff = new Date(Date.now() - config.unpaidOrderTtlMinutes * 60 * 1000);
  const stale = await Order.find({
    orderStatus: 'pending',
    paymentStatus: { $in: ['pending', 'failed'] },
    createdAt: { $lt: cutoff },
  })
    .select('_id')
    .limit(200);
  for (const { _id } of stale) {
    // eslint-disable-next-line no-await-in-loop
    await cancelOrderAtomically(_id, { fromStatuses: ['pending'], extraFilter: { paymentStatus: { $in: ['pending', 'failed'] } } });
  }
  return stale.length;
}

module.exports = { round2, restoreStock, cancelOrderAtomically, releaseStaleOrders };
