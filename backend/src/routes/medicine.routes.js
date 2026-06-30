const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.medicines,
  createRules: validators.medicines.create,
  updateRules: validators.medicines.update,
  roles: {
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});
