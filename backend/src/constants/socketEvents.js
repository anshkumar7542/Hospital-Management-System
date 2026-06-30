const SOCKET_EVENTS = {
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

const SOCKET_ROOMS = {
  dashboard: 'dashboard:live',
  user: (userId) => `user:${userId}`,
  role: (role) => `role:${role}`,
  entity: (type, id) => `entity:${type}:${id}`
};

module.exports = { SOCKET_EVENTS, SOCKET_ROOMS };
