import { create } from 'zustand';
import { authService } from '../services/authService.js';

const ACCESS_KEY = 'hms-access-token';
const REFRESH_KEY = 'hms-refresh-token';
const USER_KEY = 'hms-user';

const readJson = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: readJson(USER_KEY),
  accessToken: window.localStorage.getItem(ACCESS_KEY) || window.localStorage.getItem('accessToken'),
  refreshToken: window.localStorage.getItem(REFRESH_KEY),
  status: 'idle',
  error: null,

  get isAuthenticated() {
    return Boolean(get().accessToken);
  },

  setSession(data) {
    window.localStorage.setItem(ACCESS_KEY, data.accessToken);
    window.localStorage.setItem('accessToken', data.accessToken);
    window.localStorage.setItem(REFRESH_KEY, data.refreshToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, status: 'authenticated', error: null });
  },

  async login(payload) {
    set({ status: 'loading', error: null });
    const data = await authService.login(payload);
    get().setSession(data);
    return data;
  },

  async register(payload) {
    set({ status: 'loading', error: null });
    return authService.register(payload);
  },

  async refreshSession() {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return false;
    try {
      const data = await authService.refreshToken(refreshToken);
      get().setSession(data);
      return true;
    } catch {
      get().clearSession();
      return false;
    }
  },

  async logout() {
    const refreshToken = get().refreshToken;
    try {
      if (get().accessToken) await authService.logout({ refreshToken });
    } finally {
      get().clearSession();
    }
  },

  clearSession() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null, status: 'idle', error: null });
  }
}));
