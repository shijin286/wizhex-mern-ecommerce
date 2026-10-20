import api from './api.js';

export async function fetchServerCart() {
  const { data } = await api.get('/cart');
  return data.items; // [{ product, quantity }]
}

// Only ids and quantities are sent. The server looks up prices and stock itself.
export async function saveServerCart(items) {
  const payload = items.map((item) => ({ product: item.productId, quantity: item.quantity }));
  const { data } = await api.put('/cart', { items: payload });
  return data.items;
}
