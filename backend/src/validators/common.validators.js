const { param, query } = require('express-validator');

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid id is required')];

const pagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isString().trim().matches(/^[a-zA-Z0-9_]+$/).withMessage('sortBy must be a valid field name'),
  query('sortOrder').optional().isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('sortOrder must be asc or desc')
];

module.exports = { idParam, pagination };
