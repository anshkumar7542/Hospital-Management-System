const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.billing,
  createRules: validators.billing.create,
  updateRules: validators.billing.update,
  roles: {
    create: authorize('Admin', 'Receptionist'),
    update: authorize('Admin', 'Receptionist'),
    delete: authorize('Admin')
  }
});
