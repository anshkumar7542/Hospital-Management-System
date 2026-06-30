import { useEffect } from 'react';
import {
  connectSocket,
  disconnectSocket,
  joinDashboard,
  socketEvents
} from '../services/socketService.js';
import { useRealtimeStore } from '../store/realtimeStore.js';

export function useRealtime() {
  const store = useRealtimeStore();

  useEffect(() => {
    const token = window.localStorage.getItem('accessToken') || window.localStorage.getItem('hms-access-token');
    const socket = connectSocket(token);

    if (!socket) {
      store.setConnectionStatus('unauthenticated');
      return undefined;
    }

    const onConnect = () => {
      store.setConnectionStatus('connected', { socketId: socket.id, reconnectAttempt: 0, lastError: null });
      joinDashboard();
    };
    const onDisconnect = (reason) => {
      store.setConnectionStatus('disconnected', { lastError: reason });
    };
    const onConnectError = (error) => {
      store.setConnectionStatus('error', { lastError: error.message });
    };
    const onReconnectAttempt = (attempt) => {
      store.setConnectionStatus('reconnecting', { reconnectAttempt: attempt });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);

    socket.on(socketEvents.CONNECTION_STATUS, (payload) => {
      store.setConnectionStatus(payload.connected ? 'connected' : 'disconnected', {
        socketId: payload.socketId
      });
    });
    socket.on(socketEvents.ONLINE_USERS, store.setOnlineUsers);
    socket.on(socketEvents.NOTIFICATION_CREATED, store.pushNotification);
    socket.on(socketEvents.DASHBOARD_UPDATED, store.pushDashboardEvent);
    socket.on(socketEvents.APPOINTMENT_CREATED, (payload) => store.pushDashboardEvent({ type: 'appointment_created', payload }));
    socket.on(socketEvents.APPOINTMENT_STATUS_CHANGED, (payload) => store.pushDashboardEvent({ type: 'appointment_status_changed', payload }));
    socket.on(socketEvents.DOCTOR_STATUS_UPDATED, (payload) => store.pushDashboardEvent({ type: 'doctor_status_updated', payload }));
    socket.on(socketEvents.PATIENT_CHECKED_IN, (payload) => store.pushDashboardEvent({ type: 'patient_checked_in', payload }));
    socket.on(socketEvents.BILLING_UPDATED, (payload) => store.pushDashboardEvent({ type: 'billing_updated', payload }));
    socket.on(socketEvents.PAYMENT_CREATED, (payload) => store.pushDashboardEvent({ type: 'payment_created', payload }));
    socket.on(socketEvents.TYPING_UPDATE, store.setTypingUser);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.off(socketEvents.CONNECTION_STATUS);
      socket.off(socketEvents.ONLINE_USERS);
      socket.off(socketEvents.NOTIFICATION_CREATED);
      socket.off(socketEvents.DASHBOARD_UPDATED);
      socket.off(socketEvents.APPOINTMENT_CREATED);
      socket.off(socketEvents.APPOINTMENT_STATUS_CHANGED);
      socket.off(socketEvents.DOCTOR_STATUS_UPDATED);
      socket.off(socketEvents.PATIENT_CHECKED_IN);
      socket.off(socketEvents.BILLING_UPDATED);
      socket.off(socketEvents.PAYMENT_CREATED);
      socket.off(socketEvents.TYPING_UPDATE);
    };
  }, []);

  return store;
}

export { disconnectSocket };
