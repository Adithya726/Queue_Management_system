import api from './api';

export function registerManager(payload) {
  return api.post('/api/auth/register', payload);
}

export function loginManager(payload) {
  return api.post('/api/auth/login', payload);
}
