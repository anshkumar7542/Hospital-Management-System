const { buildCrudRoutes } = require('./crud.routes');
const controller = require('../controllers/user.controller');
const validators = require('../validators/user.validators');
const { authorize } = require('../middlewares/auth.middleware');

const router = buildCrudRoutes({
  controller,
  createRules: validators.create,
  updateRules: validators.update,
  roles: {
    read: authorize('Admin'),
    create: authorize('Admin'),
    update: authorize('Admin'),
    delete: authorize('Admin')
  }
});

// List pending users for admin approval
router.get('/pending', authorize('Admin'), controller.pending);
// Approve a pending user
router.patch('/:id/approve', authorize('Admin'), controller.approve);

module.exports = router;
