import { create } from 'zustand';

const MAX_EVENTS = 40;

export const useRealtimeStore = create((set) => ({
  connectionStatus: 'disconnected',
  socketId: null,
  reconnectAttempt: 0,
  onlineUsers: [],
  notifications: [],
  dashboardEvents: [],
  typingUsers: {},
  lastError: null,

  setConnectionStatus: (connectionStatus, extra = {}) => set({ connectionStatus, ...extra }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  pushNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, MAX_EVENTS)
    })),
  pushDashboardEvent: (event) =>
    set((state) => ({
      dashboardEvents: [event, ...state.dashboardEvents].slice(0, MAX_EVENTS)
    })),
  setTypingUser: ({ entityType, entityId, field, userId, role, typing }) =>
    set((state) => {
      const key = `${entityType}:${entityId}:${field || 'default'}`;
      const current = state.typingUsers[key] || [];
      const next = typing
        ? [...current.filter((item) => item.userId !== userId), { userId, role }]
        : current.filter((item) => item.userId !== userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [key]: next
        }
      };
    }),
  clearRealtime: () =>
    set({
      connectionStatus: 'disconnected',
      socketId: null,
      reconnectAttempt: 0,
      onlineUsers: [],
      notifications: [],
      dashboardEvents: [],
      typingUsers: {},
      lastError: null
    })
}));
