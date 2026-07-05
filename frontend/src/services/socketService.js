import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket;

export const socketEvents = {
  CONNECTION_STATUS: 'connection:status',
  ONLINE_USERS: 'presence:online_users',
  USER_ONLINE: 'presence:user_online',
  USER_OFFLINE: 'presence:user_offline',
  DOCTOR_STATUS_UPDATED: 'doctor:status_updated',
  PATIENT_CHECKED_IN: 'patient:checked_in',
  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_STATUS_CHANGED: 'appointment:status_changed',
  NOTIFICATION_CREATED: 'notification:created',
  BILLING_CREATED: 'billing:created',
  BILLING_UPDATED: 'billing:updated',
  PAYMENT_CREATED: 'payment:created',
  DASHBOARD_UPDATED: 'dashboard:updated',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  TYPING_UPDATE: 'typing:update',
  JOIN_DASHBOARD: 'dashboard:join',
  LEAVE_DASHBOARD: 'dashboard:leave',
  JOIN_ENTITY: 'entity:join',
  LEAVE_ENTITY: 'entity:leave'
};

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 12000,
    autoConnect: true
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function joinDashboard() {
  socket?.emit(socketEvents.JOIN_DASHBOARD);
}

export function leaveDashboard() {
  socket?.emit(socketEvents.LEAVE_DASHBOARD);
}

export function joinEntity(entityType, entityId) {
  socket?.emit(socketEvents.JOIN_ENTITY, { entityType, entityId });
}

export function leaveEntity(entityType, entityId) {
  socket?.emit(socketEvents.LEAVE_ENTITY, { entityType, entityId });
}

export function startTyping(entityType, entityId, field) {
  socket?.emit(socketEvents.TYPING_START, { entityType, entityId, field });
}

export function stopTyping(entityType, entityId, field) {
  socket?.emit(socketEvents.TYPING_STOP, { entityType, entityId, field });
}
