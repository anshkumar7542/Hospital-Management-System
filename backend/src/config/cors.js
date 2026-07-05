const env = require('./env');

const corsOptions = {
  origin(origin, callback) {
    if (env.nodeEnv === 'development') {
      callback(null, true);
      return;
    }

    if (!origin) {
      callback(new Error('Not allowed by CORS'));
      return;
    }

    if (env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = { corsOptions };
