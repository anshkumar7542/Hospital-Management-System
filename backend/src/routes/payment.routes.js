const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.payments,
  createRules: validators.payments.create,
  updateRules: validators.payments.update,
  roles: {
    create: authorize('Admin', 'Receptionist'),
    update: authorize('Admin', 'Receptionist'),
    delete: authorize('Admin')
  }
});
