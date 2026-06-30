const { getIo, getPresenceSnapshot } = require('../../config/socket');
const { SOCKET_EVENTS, SOCKET_ROOMS } = require('../../constants/socketEvents');

const emitSafely = (callback) => {
  try {
    callback(getIo());
  } catch (error) {
    // Socket.IO may be unavailable during tests, scripts, or import-only checks.
  }
};

const emitDashboardUpdate = (type, payload) => {
  emitSafely((io) => {
    io.to(SOCKET_ROOMS.dashboard).emit(SOCKET_EVENTS.DASHBOARD_UPDATED, {
      type,
      payload,
      emittedAt: new Date().toISOString()
    });
  });
};

const emitToRoles = (roles, event, payload) => {
  emitSafely((io) => {
    roles.forEach((role) => io.to(SOCKET_ROOMS.role(role)).emit(event, payload));
  });
};

const emitToUser = (userId, event, payload) => {
  emitSafely((io) => {
    io.to(SOCKET_ROOMS.user(userId)).emit(event, payload);
  });
};

const emitOnlineUsers = () => {
  emitSafely((io) => {
    io.emit(SOCKET_EVENTS.ONLINE_USERS, getPresenceSnapshot());
  });
};

module.exports = { emitDashboardUpdate, emitToRoles, emitToUser, emitOnlineUsers };
