const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.patients,
  createRules: validators.patients.create,
  updateRules: validators.patients.update,
  roles: {
    create: authorize('Admin', 'Receptionist'),
    update: authorize('Admin', 'Receptionist', 'Doctor'),
    delete: authorize('Admin')
  }
});
