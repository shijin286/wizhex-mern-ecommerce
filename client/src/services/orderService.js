import api from './api.js';

export async function fetchPaymentConfig() {
  const { data } = await api.get('/orders/payment-config');
  return data; // { currency, razorpay: { enabled, keyId? }, simulated: { enabled } }
}

// Only product ids and quantities are sent. The server sets every price.
export async function createOrder({ items, contact, paymentMethod, idempotencyKey }) {
  const { data } = await api.post('/orders', {
    items: items.map((item) => ({ product: item.productId, quantity: item.quantity })),
    contact,
    paymentMethod,
    idempotencyKey,
  });
  return data; // { order, payment }
}

export async function confirmPayment(orderId, payload) {
  const { data } = await api.post(`/orders/${orderId}/pay`, payload);
  return data.order;
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/my-orders');
  return data.orders;
}

export async function fetchOrder(orderId) {
  const { data } = await api.get(`/orders/${orderId}`);
  return data.order;
}

export async function cancelOrder(orderId) {
  const { data } = await api.post(`/orders/${orderId}/cancel`);
  return data.order;
}
