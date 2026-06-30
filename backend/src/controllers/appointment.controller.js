const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const services = require('../services/domain.services');
const { buildCrudController } = require('./crud.controller');
const { logActivity } = require('../services/activityLog.service');

const base = buildCrudController(services.appointments, 'Appointment', 'appointments');

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await services.appointments.updateStatus(req.params.id, req.body.status, req.user.id);
  await logActivity(req, 'update_appointment_status', 'appointments', appointment.id, `Appointment status changed to ${req.body.status}`);
  sendSuccess(res, 200, 'Appointment status updated successfully', appointment);
});

module.exports = { ...base, updateStatus };
