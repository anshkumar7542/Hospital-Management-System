const { buildCrudController } = require('./crud.controller');
const userService = require('../services/user.service');

module.exports = buildCrudController(userService, 'User', 'users');
