import api from './api.js';

export async function subscribeNewsletter(email) {
  const { data } = await api.post('/newsletter', { email });
  return data.message;
}

export async function sendContactMessage(payload) {
  const { data } = await api.post('/contact', payload);
  return data.message;
}
