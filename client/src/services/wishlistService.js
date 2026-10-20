import api from './api.js';

export async function fetchWishlist() {
  const { data } = await api.get('/wishlist');
  return data.products;
}

export async function addToWishlist(productId) {
  const { data } = await api.post(`/wishlist/${productId}`);
  return data.products;
}

export async function removeFromWishlist(productId) {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data.products;
}
