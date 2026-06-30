const ApiError = require('../utils/ApiError');
const { logger } = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || err instanceof ApiError;

  logger.error(err.message, {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  return res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Internal server error',
    errors: err.errors || []
  });
};

module.exports = { errorHandler };
