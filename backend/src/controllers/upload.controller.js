const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');
const services = require('../services/domain.services');
const { buildCrudController } = require('./crud.controller');
const { logActivity } = require('../services/activityLog.service');
const { resolveUploadPath } = require('../utils/fileStorage');
const { imageUploadTypes } = require('../constants/imageUpload.constants');

const base = buildCrudController(services.uploads, 'Upload', 'uploads');

const create = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'File is required');
  const upload = await services.uploads.createFromFile(req.file, req.body, req.user.id);
  await logActivity(req, 'upload_file', 'uploads', upload.id, 'File uploaded');
  sendSuccess(res, 201, 'File uploaded successfully', upload);
});

const createImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image is required');
  const upload = await services.uploads.createImageFromFile(req.file, req.body, req.user.id);
  await logActivity(req, 'upload_image', 'uploads', upload.id, 'Image uploaded');
  sendSuccess(res, 201, 'Image uploaded successfully', upload);
});

const updateImage = asyncHandler(async (req, res) => {
  const upload = await services.uploads.replaceImageFromFile(req.params.id, req.file, req.body);
  await logActivity(req, 'update_image', 'uploads', upload.id, 'Image updated');
  sendSuccess(res, 200, 'Image updated successfully', upload);
});

const previewImage = asyncHandler(async (req, res) => {
  const upload = await services.uploads.get(req.params.id);
  if (!imageUploadTypes[upload.upload_type]) {
    throw new ApiError(400, 'Upload is not an image resource');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.sendFile(resolveUploadPath(upload.file_name));
});

const remove = asyncHandler(async (req, res) => {
  await services.uploads.remove(req.params.id);
  await logActivity(req, 'delete_upload', 'uploads', req.params.id, 'Uploaded file deleted');
  sendSuccess(res, 200, 'File deleted successfully');
});

module.exports = { ...base, create, createImage, updateImage, previewImage, remove };
