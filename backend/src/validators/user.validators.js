const { body } = require('express-validator');

const create = [
  body('role_id').isInt({ min: 1 }).withMessage('Valid role_id is required'),
  body('full_name').isString().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional({ nullable: true }).isString().trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid user status')
];

const update = [
  body('role_id').optional().isInt({ min: 1 }).withMessage('Valid role_id is required'),
  body('full_name').optional().isString().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional({ nullable: true }).isString().trim(),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid user status')
];

module.exports = { create, update };
