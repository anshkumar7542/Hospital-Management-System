import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const MAX_RETRIES = 2;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !originalRequest._refreshAttempted) {
      originalRequest._refreshAttempted = true;
      const refreshed = await useAuthStore.getState().refreshSession();
      if (refreshed) return apiClient(originalRequest);
    }

    const canRetry = !status || status >= 500 || status === 429;
    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (canRetry && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount += 1;
      await wait(350 * originalRequest._retryCount);
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}
