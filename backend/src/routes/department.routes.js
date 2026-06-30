const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.departments,
  createRules: validators.departments.create,
  updateRules: validators.departments.update,
  roles: {
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});
