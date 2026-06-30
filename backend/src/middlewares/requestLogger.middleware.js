const morgan = require('morgan');
const { logger } = require('../config/logger');

const stream = {
  write: (message) => logger.http(message.trim())
};

const requestLogger = morgan('combined', { stream });

module.exports = { requestLogger };
