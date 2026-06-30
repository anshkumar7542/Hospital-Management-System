const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.notifications,
  createRules: validators.notifications.create,
  updateRules: validators.notifications.update,
  roles: {
    create: authorize('Admin'),
    update: authorize('Admin', 'Doctor', 'Receptionist', 'Patient'),
    delete: authorize('Admin')
  }
});
