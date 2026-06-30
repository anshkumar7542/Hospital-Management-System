const { body } = require('express-validator');
const { uploadTypes } = require('../constants/upload.constants');

const createUpload = [
  body('upload_type')
    .optional()
    .isIn(Object.keys(uploadTypes))
    .withMessage(`upload_type must be one of: ${Object.keys(uploadTypes).join(', ')}`),
  body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('patient_id must be a positive integer'),
  body('medical_record_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('medical_record_id must be a positive integer'),
  body('visibility').optional().isIn(['private', 'staff_only', 'patient_visible']).withMessage('Invalid visibility')
];

const updateUpload = [
  body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('patient_id must be a positive integer'),
  body('medical_record_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('medical_record_id must be a positive integer'),
  body('visibility').optional().isIn(['private', 'staff_only', 'patient_visible']).withMessage('Invalid visibility')
];

module.exports = { createUpload, updateUpload };
