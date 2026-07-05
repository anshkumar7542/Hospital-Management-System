const express = require('express');
const controller = require('../controllers/upload.controller');
const { authorize } = require('../middlewares/auth.middleware');
const { uploadSingleFile } = require('../middlewares/upload.middleware');
const { uploadSingleImage } = require('../middlewares/imageUpload.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { idParam, pagination } = require('../validators/common.validators');
const uploadValidators = require('../validators/upload.validators');
const imageUploadValidators = require('../validators/imageUpload.validators');

const router = express.Router();

router.get('/', validate(pagination), controller.list);
router.post(
  '/images',
  // allow patients to upload images in development and for app use
  authorize('Admin', 'Doctor', 'Receptionist', 'Patient'),
  uploadSingleImage,
  validate(imageUploadValidators.createImage),
  controller.createImage
);
router.get('/images/:id/preview', validate(idParam), controller.previewImage);
router.patch(
  '/images/:id',
  authorize('Admin', 'Doctor', 'Receptionist'),
  uploadSingleImage,
  validate([...idParam, ...imageUploadValidators.updateImage]),
  controller.updateImage
);
router.post(
  '/',
  // allow patients to upload files/documents
  authorize('Admin', 'Doctor', 'Receptionist', 'Patient'),
  uploadSingleFile,
  validate(uploadValidators.createUpload),
  controller.create
);
router.get('/:id', validate(idParam), controller.get);
router.patch('/:id', authorize('Admin'), validate([...idParam, ...uploadValidators.updateUpload]), controller.update);
router.delete('/:id', authorize('Admin'), validate(idParam), controller.remove);

module.exports = router;
