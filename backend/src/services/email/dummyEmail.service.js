const { logger } = require('../../config/logger');

const sentEmails = [];

const sendPasswordResetEmail = async ({ to, fullName, resetToken, resetUrl, expiresAt }) => {
  const email = {
    to,
    subject: 'Reset your HelixCare password',
    template: 'password-reset',
    payload: {
      fullName,
      resetToken,
      resetUrl,
      expiresAt
    },
    sentAt: new Date().toISOString()
  };

  sentEmails.push(email);
  logger.info('Dummy password reset email queued', { to, resetUrl, expiresAt });

  return email;
};

const getSentEmails = () => [...sentEmails];

module.exports = { sendPasswordResetEmail, getSentEmails };
