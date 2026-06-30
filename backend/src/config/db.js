const mysql = require('mysql2/promise');
const env = require('./env');
const { logger } = require('./logger');

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

const query = async (sql, params = {}) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    logger.info('MySQL connection established');
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, transaction, testConnection };
