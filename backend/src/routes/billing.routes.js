const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.billing,
  createRules: validators.billing.create,
  updateRules: validators.billing.update,
  roles: {
    create: authorize('Admin', 'Doctor', 'Receptionist', 'Patient'),
    update: authorize('Admin', 'Doctor', 'Receptionist', 'Patient'),
    delete: authorize('Admin')
  }
});
