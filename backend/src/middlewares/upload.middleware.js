const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { uploadTypes, allowedExtensions, allowedMimeTypes } = require('../constants/upload.constants');

fs.mkdirSync(env.uploadDir, { recursive: true });
fs.mkdirSync(path.join(env.uploadDir, 'tmp'), { recursive: true });

Object.values(uploadTypes).forEach((type) => {
  fs.mkdirSync(path.join(env.uploadDir, type.directory), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(env.uploadDir, 'tmp')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const acceptedMimeTypes = allowedMimeTypes.get(ext);

    if (!allowedExtensions.has(ext) || !acceptedMimeTypes?.has(file.mimetype)) {
      cb(new ApiError(415, 'Unsupported file type'));
      return;
    }
    cb(null, true);
  }
});

const uploadSingleFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, `File size must not exceed ${env.maxFileSizeMb}MB`));
      }
      return next(new ApiError(400, error.message));
    }

    return next(error);
  });
};

module.exports = { upload, uploadSingleFile };
