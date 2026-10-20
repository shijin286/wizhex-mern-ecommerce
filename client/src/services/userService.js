import api from './api.js';

export async function updateProfile(payload) {
  const { data } = await api.put('/users/profile', payload);
  return data.user;
}

export async function addAddress(address) {
  const { data } = await api.post('/users/addresses', address);
  return data.addresses;
}

export async function updateAddress(addressId, address) {
  const { data } = await api.put(`/users/addresses/${addressId}`, address);
  return data.addresses;
}

export async function deleteAddress(addressId) {
  const { data } = await api.delete(`/users/addresses/${addressId}`);
  return data.addresses;
}
