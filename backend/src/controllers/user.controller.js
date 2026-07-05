const { buildCrudController } = require('./crud.controller');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

const base = buildCrudController(userService, 'User', 'users');

const pending = asyncHandler(async (req, res) => {
	const { rows, meta } = await userService.pendingList(req.query);
	sendSuccess(res, 200, 'Pending users fetched successfully', rows, meta);
});

const approve = asyncHandler(async (req, res) => {
	const user = await userService.approve(req.params.id);
	sendSuccess(res, 200, 'User approved', user);
});

module.exports = { ...base, pending, approve };
