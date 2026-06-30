const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { allowedImageExtensions, allowedImageMimeTypes } = require('../constants/imageUpload.constants');

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedImageExtensions.has(ext) || !allowedImageMimeTypes.has(file.mimetype)) {
      cb(new ApiError(415, 'Unsupported image type'));
      return;
    }

    cb(null, true);
  }
});

const uploadSingleImage = (req, res, next) => {
  imageUpload.single('image')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, `Image size must not exceed ${env.maxImageFileSizeMb}MB`));
      }
      return next(new ApiError(400, error.message));
    }

    return next(error);
  });
};

module.exports = { uploadSingleImage };
