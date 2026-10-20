import api from './api.js';

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data; // { stats, recentOrders, salesByDay }
}

export async function fetchAdminOrders(params) {
  const { data } = await api.get('/admin/orders', { params: clean(params) });
  return data; // { orders, page, pages, total }
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return data.order;
}

export async function fetchAdminUsers(params) {
  const { data } = await api.get('/admin/users', { params: clean(params) });
  return data; // { users, page, pages, total }
}

// Products: the admin uses the public list endpoint with includeInactive.
export async function fetchAdminProducts(params) {
  const { data } = await api.get('/products', { params: clean({ ...params, includeInactive: 'true' }) });
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload);
  return data.product;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.product;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data.message;
}

export async function createCategory(payload) {
  const { data } = await api.post('/categories', payload);
  return data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.category;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data.message;
}
