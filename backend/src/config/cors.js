const env = require('./env');

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/$/, '');

const allowedOrigins = new Set(
  [...env.corsOrigins, env.clientUrl]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const createCorsError = () => {
  const error = new Error('Not allowed by CORS');
  error.statusCode = 403;
  error.isOperational = true;
  return error;
};

const corsOptions = {
  origin(origin, callback) {
    if (env.nodeEnv === 'development') {
      callback(null, true);
      return;
    }

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(createCorsError());
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = { corsOptions };
