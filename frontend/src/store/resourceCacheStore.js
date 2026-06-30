import { create } from 'zustand';

export const useResourceCacheStore = create((set, get) => ({
  cache: {},
  getCache: (key) => get().cache[key],
  setCache: (key, value) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { ...value, cachedAt: Date.now() }
      }
    })),
  invalidate: (prefix) =>
    set((state) => ({
      cache: Object.fromEntries(Object.entries(state.cache).filter(([key]) => !key.startsWith(prefix)))
    }))
}));
