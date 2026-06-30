const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const authService = require('../services/auth.service');
const { logActivity } = require('../services/activityLog.service');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  req.user = { id: data.user.id };
  await logActivity(req, 'register', 'users', data.user.id, 'User registered');
  sendSuccess(res, 201, 'Registration successful. Please verify your email.', data);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  req.user = { id: data.user.id };
  await logActivity(req, 'login', 'users', data.user.id, 'User logged in');
  sendSuccess(res, 200, 'Login successful', data);
});

const refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refreshSession(req.body.refreshToken, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  sendSuccess(res, 200, 'Token refreshed successfully', data);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  sendSuccess(res, 200, 'Profile fetched successfully', user);
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  await logActivity(req, 'change_password', 'users', req.user.id, 'Password changed');
  sendSuccess(res, 200, 'Password changed successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const reset = await authService.createResetToken(req.body.email);
  sendSuccess(res, 200, 'If the email exists, a password reset link has been sent', {
    expiresInMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 30),
    resetToken: process.env.NODE_ENV === 'production' ? undefined : reset?.token,
    resetUrl: process.env.NODE_ENV === 'production' ? undefined : reset?.resetUrl
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  await logActivity(req, 'reset_password', 'users', null, 'Password reset completed');
  sendSuccess(res, 200, 'Password reset successfully');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken, req.user.id, Boolean(req.body.allDevices));
  await logActivity(req, 'logout', 'users', req.user.id, 'User logged out');
  sendSuccess(res, 200, 'Logout successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, 200, 'Email verified successfully');
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const token = await authService.resendEmailVerification(req.body.email);
  sendSuccess(res, 200, 'If the email is unverified, a verification token has been generated', {
    verificationToken: process.env.NODE_ENV === 'production' ? undefined : token
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendEmailVerification
};
