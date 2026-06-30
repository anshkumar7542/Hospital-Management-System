const { body } = require('express-validator');
const { imageUploadTypes, imageEntityTypes } = require('../constants/imageUpload.constants');

const imageTypes = Object.keys(imageUploadTypes);

const createImage = [
  body('image_type').isIn(imageTypes).withMessage(`image_type must be one of: ${imageTypes.join(', ')}`),
  body('entity_type').isIn(imageEntityTypes).withMessage(`entity_type must be one of: ${imageEntityTypes.join(', ')}`),
  body('entity_id').isInt({ min: 1 }).withMessage('entity_id must be a positive integer'),
  body('visibility').optional().isIn(['private', 'staff_only', 'patient_visible']).withMessage('Invalid visibility')
];

const updateImage = [
  body('image_type').optional().isIn(imageTypes).withMessage(`image_type must be one of: ${imageTypes.join(', ')}`),
  body('entity_type').optional().isIn(imageEntityTypes).withMessage(`entity_type must be one of: ${imageEntityTypes.join(', ')}`),
  body('entity_id').optional().isInt({ min: 1 }).withMessage('entity_id must be a positive integer'),
  body('visibility').optional().isIn(['private', 'staff_only', 'patient_visible']).withMessage('Invalid visibility')
];

module.exports = { createImage, updateImage };
