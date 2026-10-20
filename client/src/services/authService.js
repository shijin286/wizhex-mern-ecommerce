import api from './api.js';

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data; // { token, user }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { token, user }
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.user;
}
