const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const userRepository = require('../repositories/user.repository');
const authRepository = require('../repositories/auth.repository');
const { comparePassword, hashPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../utils/token');
const env = require('../config/env');
const { sendPasswordResetEmail } = require('./email/dummyEmail.service');

const sanitizeUser = (user) => ({
  id: user.id,
  roleId: user.role_id,
  role: user.role_name,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  status: user.status,
  emailVerifiedAt: user.email_verified_at
});

const addExpiry = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const value = Number(match[1]);
  const unit = match[2];
  const multiplier = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[unit];
  return new Date(Date.now() + value * multiplier);
};

const randomToken = () => crypto.randomBytes(32).toString('hex');

const createEmailVerificationToken = async (userId) => {
  const token = randomToken();
  await authRepository.createEmailVerificationToken(
    userId,
    hashToken(token),
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  return token;
};

const issueSession = async (user, { rememberLogin = false, ipAddress = null, userAgent = null } = {}) => {
  const accessToken = signAccessToken(user);
  const refresh = signRefreshToken(user, { rememberLogin });
  await authRepository.createRefreshToken({
    userId: user.id,
    jti: refresh.jti,
    tokenHash: hashToken(refresh.token),
    rememberLogin,
    expiresAt: addExpiry(refresh.expiresIn),
    ipAddress,
    userAgent
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: refresh.token,
    tokenType: 'Bearer',
    expiresIn: env.jwt.accessExpiresIn,
    rememberLogin
  };
};

const register = async ({ fullName, email, phone, password, role = 'Patient' }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new ApiError(409, 'Email is already registered');

  const selectedRole = await userRepository.findRoleByName(role);
  if (!selectedRole) throw new ApiError(400, 'Invalid role');

  const user = await userRepository.create({
    role_id: selectedRole.id,
    full_name: fullName,
    email,
    phone: phone || null,
    password_hash: await hashPassword(password),
    status: 'active'
  });

  const verificationToken = await createEmailVerificationToken(user.id);
  return {
    user: sanitizeUser({ ...user, role_name: selectedRole.name }),
    emailVerification: {
      message: 'Dummy email verification token generated',
      token: env.nodeEnv === 'production' ? undefined : verificationToken
    }
  };
};

const login = async ({ email, password, rememberLogin = false }, context = {}) => {
  const user = await userRepository.findByEmail(email);
  if (!user || user.status !== 'active') {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) throw new ApiError(401, 'Invalid credentials');

  await authRepository.touchLastLogin(user.id);

  return issueSession(user, { rememberLogin, ...context });
};

const me = async (userId) => {
  const user = await userRepository.findProfileById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return sanitizeUser(user);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findProfileById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const authUser = await userRepository.findByEmail(user.email);
  const isValid = await comparePassword(currentPassword, authUser.password_hash);
  if (!isValid) throw new ApiError(400, 'Current password is incorrect');

  await authRepository.updatePassword(userId, await hashPassword(newPassword));
  await authRepository.revokeAllUserRefreshTokens(userId);
};

const createResetToken = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user || user.status !== 'active') return null;

  await authRepository.revokeActivePasswordResetTokens(user.id);

  const rawToken = randomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + env.passwordResetExpiresMinutes * 60 * 1000);
  const resetUrl = `${env.frontendResetPasswordUrl}?token=${rawToken}`;
  await authRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

  const emailResult = await sendPasswordResetEmail({
    to: user.email,
    fullName: user.full_name,
    resetToken: rawToken,
    resetUrl,
    expiresAt: expiresAt.toISOString()
  });

  return {
    token: rawToken,
    resetUrl,
    expiresAt,
    email: emailResult
  };
};

const resetPassword = async (token, newPassword) => {
  const tokenHash = hashToken(token);
  const resetToken = await authRepository.findValidPasswordResetToken(tokenHash);
  if (!resetToken) throw new ApiError(400, 'Invalid or expired reset token');

  const user = await userRepository.findProfileById(resetToken.user_id);
  if (!user || user.status !== 'active') throw new ApiError(400, 'User account is not active');

  const authUser = await userRepository.findByEmail(user.email);
  const isSamePassword = await comparePassword(newPassword, authUser.password_hash);
  if (isSamePassword) throw new ApiError(400, 'New password must be different from the current password');

  await authRepository.updatePassword(resetToken.user_id, await hashPassword(newPassword));
  await authRepository.markPasswordResetTokenUsed(resetToken.id);
  await authRepository.revokeAllUserRefreshTokens(resetToken.user_id);
};

const refreshSession = async (refreshToken, context = {}) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (decoded.tokenType !== 'refresh' || !decoded.jti) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const storedToken = await authRepository.findActiveRefreshToken(decoded.jti, hashToken(refreshToken));
  if (!storedToken) throw new ApiError(401, 'Refresh token has been revoked');

  const user = await userRepository.findProfileById(decoded.id);
  if (!user || user.status !== 'active') throw new ApiError(401, 'User is no longer active');

  const refresh = signRefreshToken(user, { rememberLogin: Boolean(storedToken.remember_login) });
  await authRepository.revokeRefreshToken(decoded.jti, refresh.jti);
  await authRepository.createRefreshToken({
    userId: user.id,
    jti: refresh.jti,
    tokenHash: hashToken(refresh.token),
    rememberLogin: Boolean(storedToken.remember_login),
    expiresAt: addExpiry(refresh.expiresIn),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(user),
    refreshToken: refresh.token,
    tokenType: 'Bearer',
    expiresIn: env.jwt.accessExpiresIn,
    rememberLogin: Boolean(storedToken.remember_login)
  };
};

const logout = async (refreshToken, userId, allDevices = false) => {
  if (allDevices) {
    await authRepository.revokeAllUserRefreshTokens(userId);
    return;
  }

  if (!refreshToken) return;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded.id !== userId) throw new ApiError(403, 'Refresh token does not belong to current user');
    await authRepository.revokeRefreshToken(decoded.jti);
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token');
  }
};

const verifyEmail = async (token) => {
  const verificationToken = await authRepository.findValidEmailVerificationToken(hashToken(token));
  if (!verificationToken) throw new ApiError(400, 'Invalid or expired email verification token');

  await userRepository.markEmailVerified(verificationToken.user_id);
  await authRepository.markEmailVerificationTokenUsed(verificationToken.id);
};

const resendEmailVerification = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return null;
  if (user.email_verified_at) return null;
  return createEmailVerificationToken(user.id);
};

module.exports = {
  register,
  login,
  me,
  changePassword,
  createResetToken,
  resetPassword,
  refreshSession,
  logout,
  verifyEmail,
  resendEmailVerification
};
