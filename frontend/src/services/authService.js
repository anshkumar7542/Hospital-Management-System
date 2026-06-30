import { apiClient } from './apiClient.js';

export const authService = {
  async login(payload) {
    const { data } = await apiClient.post('/auth/login', payload);
    return data.data;
  },
  async register(payload) {
    const { data } = await apiClient.post('/auth/register', payload);
    return data.data;
  },
  async refreshToken(refreshToken) {
    const { data } = await apiClient.post('/auth/refresh-token', { refreshToken });
    return data.data;
  },
  async forgotPassword(email) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data.data;
  },
  async resetPassword(payload) {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data.data;
  },
  async me() {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },
  async logout(payload) {
    const { data } = await apiClient.post('/auth/logout', payload);
    return data;
  }
};
