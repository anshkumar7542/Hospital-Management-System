const http = require('http');
const { app } = require('./src/app');
const env = require('./src/config/env');
const { logger } = require('./src/config/logger');
const { initSocket } = require('./src/config/socket');
const { testConnection } = require('./src/config/db');

const server = http.createServer(app);
initSocket(server);

const start = async (attempt = 1) => {
  if (!server.listening) {
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.warn(`Port ${env.port} is already in use; continuing with the existing server`);
        return;
      }

      logger.error('Server failed to start', { message: error.message, stack: error.stack });
      process.exit(1);
    });

    server.listen(env.port, () => {
      logger.info(`HMS API running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  }

  try {
    await testConnection();
  } catch (error) {
    logger.warn(`Database unavailable, retrying in 5s (attempt ${attempt})`, {
      message: error.message
    });
    setTimeout(() => start(attempt + 1), 5000);
  }
};

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', { message: error.message, stack: error.stack });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing HTTP server.');
  server.close(() => process.exit(0));
});

start();
