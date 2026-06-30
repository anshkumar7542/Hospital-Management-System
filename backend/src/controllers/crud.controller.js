const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { logActivity } = require('../services/activityLog.service');

const buildCrudController = (service, resourceName, activityEntity) => ({
  list: asyncHandler(async (req, res) => {
    const { rows, meta } = await service.list(req.query);
    sendSuccess(res, 200, `${resourceName} list fetched successfully`, rows, meta);
  }),

  get: asyncHandler(async (req, res) => {
    const record = await service.get(req.params.id);
    sendSuccess(res, 200, `${resourceName} fetched successfully`, record);
  }),

  create: asyncHandler(async (req, res) => {
    const record = await service.create(req.body);
    await logActivity(req, `create_${activityEntity}`, activityEntity, record.id, `${resourceName} created`);
    sendSuccess(res, 201, `${resourceName} created successfully`, record);
  }),

  update: asyncHandler(async (req, res) => {
    const record = await service.update(req.params.id, req.body);
    await logActivity(req, `update_${activityEntity}`, activityEntity, record.id, `${resourceName} updated`);
    sendSuccess(res, 200, `${resourceName} updated successfully`, record);
  }),

  remove: asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    await logActivity(req, `delete_${activityEntity}`, activityEntity, req.params.id, `${resourceName} deleted`);
    sendSuccess(res, 200, `${resourceName} deleted successfully`);
  })
});

module.exports = { buildCrudController };
