const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const validators = require('../validators/domain.validators');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.doctors,
  createRules: validators.doctors.create,
  updateRules: validators.doctors.update,
  roles: {
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});
