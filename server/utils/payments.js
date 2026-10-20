const crypto = require('crypto');
const config = require('../config/env');
const ApiError = require('./ApiError');

const razorpayEnabled = () => Boolean(config.razorpay.keyId && config.razorpay.keySecret);

const toMinorUnits = (amount) => Math.round(amount * 100);

/** Creates an order with Razorpay's REST API (test keys only in development). */
async function createRazorpayOrder({ amount, currency, receipt }) {
  const auth = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: toMinorUnits(amount), currency, receipt }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(502, data?.error?.description || 'Could not start the online payment. Please try again.');
  }
  return data;
}

/** Verifies Razorpay's checkout signature: HMAC-SHA256(order_id|payment_id, key_secret). */
function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function paymentConfig() {
  return {
    currency: config.currency,
    razorpay: razorpayEnabled() ? { enabled: true, keyId: config.razorpay.keyId } : { enabled: false },
    simulated: { enabled: config.allowSimulatedPayments },
  };
}

module.exports = { razorpayEnabled, createRazorpayOrder, verifyRazorpaySignature, paymentConfig, toMinorUnits };
