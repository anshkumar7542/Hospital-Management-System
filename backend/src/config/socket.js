const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('./env');
const { logger } = require('./logger');
const { SOCKET_EVENTS, SOCKET_ROOMS } = require('../constants/socketEvents');

let io;
const onlineUsers = new Map();

const getPresenceSnapshot = () =>
  Array.from(onlineUsers.values()).map((user) => ({
    id: user.id,
    role: user.role,
    roleId: user.roleId,
    socketCount: user.socketIds.size,
    connectedAt: user.connectedAt,
    lastSeenAt: user.lastSeenAt
  }));

const broadcastPresence = () => {
  if (!io) return;
  io.emit(SOCKET_EVENTS.ONLINE_USERS, getPresenceSnapshot());
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ['websocket', 'polling']
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Socket authentication required'));

    try {
      socket.user = jwt.verify(token, env.jwt.accessSecret);
      return next();
    } catch (error) {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    const userRoom = `user:${socket.user.id}`;
    const roleRoom = `role:${socket.user.role}`;
    socket.join(userRoom);
    socket.join(roleRoom);

    const userId = String(socket.user.id);
    const existing = onlineUsers.get(userId);
    if (existing) {
      existing.socketIds.add(socket.id);
      existing.lastSeenAt = new Date().toISOString();
    } else {
      onlineUsers.set(userId, {
        id: socket.user.id,
        role: socket.user.role,
        roleId: socket.user.roleId,
        socketIds: new Set([socket.id]),
        connectedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString()
      });
      socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
        id: socket.user.id,
        role: socket.user.role,
        roleId: socket.user.roleId
      });
    }

    logger.info('Socket connected', { socketId: socket.id, userId: socket.user.id });
    socket.emit(SOCKET_EVENTS.CONNECTION_STATUS, {
      connected: true,
      socketId: socket.id,
      userId: socket.user.id,
      connectedAt: new Date().toISOString()
    });
    broadcastPresence();

    socket.on(SOCKET_EVENTS.JOIN_DASHBOARD, () => {
      socket.join(SOCKET_ROOMS.dashboard);
    });

    socket.on(SOCKET_EVENTS.LEAVE_DASHBOARD, () => {
      socket.leave(SOCKET_ROOMS.dashboard);
    });

    socket.on(SOCKET_EVENTS.JOIN_ENTITY, ({ entityType, entityId } = {}) => {
      if (!entityType || !entityId) return;
      socket.join(SOCKET_ROOMS.entity(entityType, entityId));
    });

    socket.on(SOCKET_EVENTS.LEAVE_ENTITY, ({ entityType, entityId } = {}) => {
      if (!entityType || !entityId) return;
      socket.leave(SOCKET_ROOMS.entity(entityType, entityId));
    });

    socket.on(SOCKET_EVENTS.TYPING_START, ({ entityType, entityId, field } = {}) => {
      if (!entityType || !entityId) return;
      socket.to(SOCKET_ROOMS.entity(entityType, entityId)).emit(SOCKET_EVENTS.TYPING_UPDATE, {
        userId: socket.user.id,
        role: socket.user.role,
        entityType,
        entityId,
        field,
        typing: true,
        emittedAt: new Date().toISOString()
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ entityType, entityId, field } = {}) => {
      if (!entityType || !entityId) return;
      socket.to(SOCKET_ROOMS.entity(entityType, entityId)).emit(SOCKET_EVENTS.TYPING_UPDATE, {
        userId: socket.user.id,
        role: socket.user.role,
        entityType,
        entityId,
        field,
        typing: false,
        emittedAt: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      const presence = onlineUsers.get(userId);
      if (presence) {
        presence.socketIds.delete(socket.id);
        presence.lastSeenAt = new Date().toISOString();

        if (presence.socketIds.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, {
            id: socket.user.id,
            role: socket.user.role,
            roleId: socket.user.roleId
          });
        }
      }

      logger.info('Socket disconnected', { socketId: socket.id, userId: socket.user.id });
      broadcastPresence();
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.IO has not been initialized');
  return io;
};

module.exports = { initSocket, getIo, getPresenceSnapshot };
