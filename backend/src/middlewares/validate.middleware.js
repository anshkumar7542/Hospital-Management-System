const { validationResult } = require('express-validator');
const fs = require('fs/promises');
const ApiError = require('../utils/ApiError');

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    if (req.file?.path) {
      fs.rm(req.file.path, { force: true }).catch(() => {});
    }

    const errors = result.array().map((error) => ({
      field: error.path,
      message: error.msg
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }
];

module.exports = { validate };
