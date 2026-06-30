const { query } = require('../config/db');

const touchLastLogin = (userId) => query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);

const createPasswordResetToken = (userId, tokenHash, expiresAt) =>
  query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    userId,
    tokenHash,
    expiresAt
  ]);

const revokeActivePasswordResetTokens = (userId) =>
  query('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [userId]);

const findValidPasswordResetToken = async (tokenHash) => {
  const rows = await query(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

const markPasswordResetTokenUsed = (id) =>
  query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [id]);

const updatePassword = (userId, passwordHash) =>
  query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);

const createRefreshToken = ({ userId, jti, tokenHash, rememberLogin, expiresAt, ipAddress, userAgent }) =>
  query(
    `INSERT INTO refresh_tokens
       (user_id, jti, token_hash, remember_login, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, jti, tokenHash, rememberLogin, expiresAt, ipAddress, userAgent]
  );

const findActiveRefreshToken = async (jti, tokenHash) => {
  const rows = await query(
    `SELECT * FROM refresh_tokens
     WHERE jti = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [jti, tokenHash]
  );
  return rows[0] || null;
};

const revokeRefreshToken = (jti, replacedByJti = null) =>
  query('UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_jti = ? WHERE jti = ?', [replacedByJti, jti]);

const revokeAllUserRefreshTokens = (userId) =>
  query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [userId]);

const createEmailVerificationToken = (userId, tokenHash, expiresAt) =>
  query('INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    userId,
    tokenHash,
    expiresAt
  ]);

const findValidEmailVerificationToken = async (tokenHash) => {
  const rows = await query(
    `SELECT * FROM email_verification_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

const markEmailVerificationTokenUsed = (id) =>
  query('UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ?', [id]);

module.exports = {
  touchLastLogin,
  createPasswordResetToken,
  revokeActivePasswordResetTokens,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updatePassword,
  createRefreshToken,
  findActiveRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  createEmailVerificationToken,
  findValidEmailVerificationToken,
  markEmailVerificationTokenUsed
};
