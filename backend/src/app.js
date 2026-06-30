const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const env = require('./config/env');
const { corsOptions } = require('./config/cors');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { requestLogger } = require('./middlewares/requestLogger.middleware');
const { notFound } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestLogger);
app.use(apiLimiter);

app.use(
  '/uploads',
  express.static(path.resolve(env.uploadDir), {
    index: false,
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, max-age=86400');
    }
  })
);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(env.apiPrefix, routes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital Management API is healthy',
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
