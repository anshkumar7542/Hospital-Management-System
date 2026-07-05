const mysql = require('mysql2/promise');
const env = require('./env');
const { logger } = require('./logger');
const fallbackDb = require('./fallbackDb');

// Start in fallback mode automatically when configured (useful for local dev)
let fallbackMode = Boolean(env.useFallbackDb);
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  namedPlaceholders: true,
  timezone: 'Z',
  decimalNumbers: true
});

const isConnectionError = (error) => {
  return [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ER_ACCESS_DENIED_ERROR',
    'ER_BAD_DB_ERROR',
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET'
  ].includes(error?.code);
};

const useFallback = (error, context) => {
  if (fallbackMode) return true;
  if (env.nodeEnv === 'development' && isConnectionError(error)) {
    logger.warn('Switching to fallback database due to MySQL connectivity issue', {
      context,
      code: error.code,
      message: error.message
    });
    fallbackMode = true;
    return true;
  }
  return false;
};

const query = async (sql, params = {}) => {
  if (fallbackMode) {
    return fallbackDb.query(sql, params);
  }

  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    if (useFallback(error, 'query')) {
      return fallbackDb.query(sql, params);
    }
    throw error;
  }
};

const transaction = async (callback) => {
  if (fallbackMode) {
    return fallbackDb.transaction(callback);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    if (useFallback(error, 'transaction')) {
      return fallbackDb.transaction(callback);
    }
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const testConnection = async () => {
  if (fallbackMode) {
    logger.warn('Using fallback database because MySQL is unavailable');
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.ping();
    logger.info('MySQL connection established');
  } catch (error) {
    if (useFallback(error, 'testConnection')) {
      return;
    }
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, transaction, testConnection };
