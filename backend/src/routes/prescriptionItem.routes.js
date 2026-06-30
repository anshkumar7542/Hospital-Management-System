const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.prescriptionItems,
  createRules: validators.prescriptionItems.create,
  updateRules: validators.prescriptionItems.update,
  roles: {
    read: authorize('Admin', 'Doctor'),
    create: authorize('Admin', 'Doctor'),
    update: authorize('Admin', 'Doctor'),
    delete: authorize('Admin')
  }
});
