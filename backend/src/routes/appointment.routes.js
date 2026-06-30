const express = require('express');
const controller = require('../controllers/appointment.controller');
const validators = require('../validators/domain.validators');
const { validate } = require('../middlewares/validate.middleware');
const { idParam, pagination } = require('../validators/common.validators');
const { authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', validate(pagination), controller.list);
router.post('/', authorize('Admin', 'Receptionist', 'Doctor'), validate(validators.appointments.create), controller.create);
router.get('/:id', validate(idParam), controller.get);
router.patch('/:id', authorize('Admin', 'Receptionist', 'Doctor'), validate([...idParam, ...validators.appointments.update]), controller.update);
router.patch('/:id/status', authorize('Admin', 'Receptionist', 'Doctor'), validate([...idParam, ...validators.appointments.status]), controller.updateStatus);
router.delete('/:id', authorize('Admin'), validate(idParam), controller.remove);

module.exports = router;
