const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const services = require('../services/domain.services');
const { buildCrudController } = require('./crud.controller');
const { logActivity } = require('../services/activityLog.service');

const base = buildCrudController(services.appointments, 'Appointment', 'appointments');

const create = asyncHandler(async (req, res) => {
  const appointment = await services.appointments.create(req.body, req.user);
  await logActivity(req, 'create_appointments', 'appointments', appointment.id, 'Appointment created');
  sendSuccess(res, 201, 'Appointment created successfully', appointment);
});

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await services.appointments.list(req.query, req.user);
  sendSuccess(res, 200, 'Appointment list fetched successfully', rows, meta);
});

const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await services.appointments.updateStatus(req.params.id, req.body, req.user.id);
  await logActivity(req, 'update_appointment_status', 'appointments', appointment.id, `Appointment status changed to ${req.body.status}`);
  sendSuccess(res, 200, 'Appointment status updated successfully', appointment);
});

module.exports = { ...base, create, list, updateStatus };
