const { body } = require('express-validator');

const allowedRoles = ['Admin', 'Doctor', 'Receptionist', 'Patient'];

const strongPassword = (field = 'newPassword') =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain a special character');

const register = [
  body('fullName').isString().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional({ nullable: true }).isString().trim(),
  strongPassword('password'),
  body('role').optional().isIn(allowedRoles).withMessage('Invalid role')
];

const login = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('rememberLogin').optional().isBoolean().withMessage('rememberLogin must be boolean')
];

const refreshToken = [body('refreshToken').notEmpty().withMessage('Refresh token is required')];

const changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  strongPassword('newPassword')
];

const forgotPassword = [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')];

const resetPassword = [
  body('token').isString().trim().isLength({ min: 32 }).withMessage('Valid reset token is required'),
  strongPassword('newPassword'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Password confirmation does not match')
];

const logout = [
  body('refreshToken').optional().isString().withMessage('Refresh token must be a string'),
  body('allDevices').optional().isBoolean().withMessage('allDevices must be boolean')
];

const verifyEmail = [body('token').notEmpty().withMessage('Verification token is required')];

const resendEmailVerification = [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')];

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendEmailVerification
};
