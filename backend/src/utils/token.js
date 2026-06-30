const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role_name || user.role,
      roleId: user.role_id,
      emailVerifiedAt: user.email_verified_at || user.emailVerifiedAt || null
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );

const signRefreshToken = (user, options = {}) => {
  const jti = options.jti || crypto.randomUUID();
  const expiresIn = options.rememberLogin ? env.jwt.rememberRefreshExpiresIn : env.jwt.refreshExpiresIn;

  const token = jwt.sign({ id: user.id, tokenType: 'refresh', jti }, env.jwt.refreshSecret, {
    expiresIn
  });

  return { token, jti, expiresIn };
};

const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken };
