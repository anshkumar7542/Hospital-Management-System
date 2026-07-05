const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  if (env.nodeEnv === 'development') {
    req.user = { id: 1, role: 'Admin', emailVerifiedAt: new Date().toISOString() };
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.user = jwt.verify(header.slice(7), env.jwt.accessSecret);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (env.nodeEnv === 'development') return next();

  const role = req.user?.role_name || req.user?.role;
  if (!roles.includes(role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  return next();
};

const requireVerifiedEmail = (req, res, next) => {
  if (!req.user.emailVerifiedAt) {
    return next(new ApiError(403, 'Email verification required'));
  }
  return next();
};

module.exports = { authenticate, authorize, requireVerifiedEmail };
