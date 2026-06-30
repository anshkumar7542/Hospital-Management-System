const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const requireEnv = (key, fallback) => {
  const value = process.env[key] || fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const numberEnv = (key, fallback) => Number(requireEnv(key, fallback));

module.exports = {
  nodeEnv: requireEnv('NODE_ENV', 'development'),
  port: numberEnv('PORT', 5000),
  apiPrefix: requireEnv('API_PREFIX', '/api/v1'),
  clientUrl: requireEnv('CLIENT_URL', 'http://localhost:5173'),
  corsOrigins: requireEnv('CORS_ORIGINS', 'http://localhost:5173').split(',').map((origin) => origin.trim()),
  db: {
    host: requireEnv('DB_HOST', 'localhost'),
    port: numberEnv('DB_PORT', 3306),
    user: requireEnv('DB_USER', 'root'),
    password: requireEnv('DB_PASSWORD', ''),
    database: requireEnv('DB_NAME', 'hospital_management_system'),
    connectionLimit: numberEnv('DB_CONNECTION_LIMIT', 10)
  },
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: requireEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: requireEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    rememberRefreshExpiresIn: requireEnv('JWT_REMEMBER_REFRESH_EXPIRES_IN', '30d')
  },
  bcryptSaltRounds: numberEnv('BCRYPT_SALT_ROUNDS', 12),
  passwordResetExpiresMinutes: numberEnv('PASSWORD_RESET_EXPIRES_MINUTES', 30),
  frontendResetPasswordUrl: requireEnv('FRONTEND_RESET_PASSWORD_URL', 'http://localhost:5173/reset-password'),
  rateLimitWindowMs: numberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMax: numberEnv('RATE_LIMIT_MAX', 300),
  authRateLimitMax: numberEnv('AUTH_RATE_LIMIT_MAX', 20),
  uploadDir: path.resolve(process.cwd(), requireEnv('UPLOAD_DIR', 'uploads')),
  maxFileSizeMb: numberEnv('MAX_FILE_SIZE_MB', 10),
  maxImageFileSizeMb: numberEnv('MAX_IMAGE_FILE_SIZE_MB', 5),
  logLevel: requireEnv('LOG_LEVEL', 'info')
};
