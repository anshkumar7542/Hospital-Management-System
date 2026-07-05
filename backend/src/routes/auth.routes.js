const express = require('express');
const controller = require('../controllers/auth.controller');
const validators = require('../validators/auth.validators');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.get('/register', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'Registration requires a POST request',
    errors: []
  });
});
router.post('/register', authLimiter, validate(validators.register), controller.register);
router.post('/login', authLimiter, validate(validators.login), controller.login);
router.post('/refresh-token', authLimiter, validate(validators.refreshToken), controller.refreshToken);
router.post('/forgot-password', authLimiter, validate(validators.forgotPassword), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(validators.resetPassword), controller.resetPassword);
router.post('/verify-email', authLimiter, validate(validators.verifyEmail), controller.verifyEmail);
router.post('/resend-verification', authLimiter, validate(validators.resendEmailVerification), controller.resendEmailVerification);
router.get('/me', authenticate, controller.me);
router.patch('/change-password', authenticate, validate(validators.changePassword), controller.changePassword);
router.post('/logout', authenticate, validate(validators.logout), controller.logout);

module.exports = router;
