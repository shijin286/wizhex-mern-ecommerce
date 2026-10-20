import api, { isCancel } from './api.js';
import { DEMO_FALLBACK_ENABLED, setDemoMode } from '../utils/demoMode.js';

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

// True when the API can't be reached at all (network error, or a 5xx with no
// JSON body, which is what the Vite dev proxy returns when the server is down).
function isServerUnavailable(error) {
  if (isCancel(error)) return false;
  if (!error?.response) return true;
  return error.response.status >= 500 && !error.response.data?.message;
}

/**
 * Calls the API; if the backend is offline in development, falls back to the
 * bundled demo catalogue so the UI can still be previewed with real photos.
 */
async function withDemoFallback(apiCall, demoCall) {
  try {
    const result = await apiCall();
    setDemoMode(false);
    return result;
  } catch (error) {
    if (!DEMO_FALLBACK_ENABLED || !isServerUnavailable(error)) throw error;
    const demo = await import('../data/demoCatalog.js');
    setDemoMode(true);
    return demoCall(demo);
  }
}

export function fetchProducts(params = {}, signal) {
  return withDemoFallback(
    async () => (await api.get('/products', { params: cleanParams(params), signal })).data, // { products, page, pages, total }
    (demo) => demo.queryDemoProducts(params),
  );
}

export function fetchProduct(id) {
  return withDemoFallback(
    async () => (await api.get(`/products/${id}`)).data.product,
    (demo) => {
      const product = demo.DEMO_PRODUCTS.find((p) => p._id === id);
      if (!product) {
        const error = new Error('Product not found');
        error.response = { status: 404, data: { message: 'Product not found' } };
        throw error;
      }
      return product;
    },
  );
}

export function fetchCategories() {
  return withDemoFallback(
    async () => (await api.get('/categories')).data.categories,
    (demo) => demo.getDemoCategories(),
  );
}

export function fetchReviews(productId) {
  return withDemoFallback(
    async () => (await api.get(`/products/${productId}/reviews`)).data.reviews,
    (demo) => demo.getDemoReviews(productId),
  );
}

export async function createReview(productId, review) {
  const { data } = await api.post(`/products/${productId}/reviews`, review);
  return data.review;
}
