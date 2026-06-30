const { query } = require('../config/db');
const { buildRepository } = require('./base.repository');

const base = buildRepository({
  table: 'users',
  columns: ['role_id', 'full_name', 'email', 'phone', 'password_hash', 'status', 'last_login_at', 'email_verified_at', 'deleted_at'],
  searchable: ['full_name', 'email', 'phone']
});

const findByEmail = async (email) => {
  const rows = await query(
    `SELECT users.*, roles.name AS role_name
     FROM users
     INNER JOIN roles ON roles.id = users.role_id
     WHERE users.email = ? AND users.deleted_at IS NULL
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findProfileById = async (id) => {
  const rows = await query(
    `SELECT users.id, users.role_id, roles.name AS role_name, users.full_name, users.email,
            users.phone, users.status, users.last_login_at, users.email_verified_at,
            users.created_at, users.updated_at
     FROM users
     INNER JOIN roles ON roles.id = users.role_id
     WHERE users.id = ? AND users.deleted_at IS NULL
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findRoleByName = async (name) => {
  const rows = await query('SELECT id, name FROM roles WHERE name = ? LIMIT 1', [name]);
  return rows[0] || null;
};

const markEmailVerified = (userId) =>
  query('UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?', [userId]);

module.exports = { ...base, findByEmail, findProfileById, findRoleByName, markEmailVerified };
