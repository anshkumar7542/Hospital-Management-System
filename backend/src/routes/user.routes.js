const { buildCrudRoutes } = require('./crud.routes');
const controller = require('../controllers/user.controller');
const validators = require('../validators/user.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller,
  createRules: validators.create,
  updateRules: validators.update,
  roles: {
    read: authorize('Admin'),
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});
