const { buildCrudRoutes } = require('./crud.routes');
const controllers = require('../controllers/domain.controllers');
const { authorize } = require('../middlewares/auth.middleware');

module.exports = buildCrudRoutes({
  controller: controllers.activityLogs,
  roles: {
    read: authorize('Admin'),
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});
