const services = require('../services/domain.services');
const { buildCrudController } = require('./crud.controller');

module.exports = {
  departments: buildCrudController(services.departments, 'Department', 'departments'),
  doctors: buildCrudController(services.doctors, 'Doctor', 'doctors'),
  patients: buildCrudController(services.patients, 'Patient', 'patients'),
  medicalRecords: buildCrudController(services.medicalRecords, 'Medical record', 'medical_records'),
  billing: buildCrudController(services.billing, 'Billing record', 'billing'),
  payments: buildCrudController(services.payments, 'Payment', 'payments'),
  medicines: buildCrudController(services.medicines, 'Medicine', 'medicines'),
  prescriptions: buildCrudController(services.prescriptions, 'Prescription', 'prescriptions'),
  prescriptionItems: buildCrudController(services.prescriptionItems, 'Prescription item', 'prescription_items'),
  notifications: buildCrudController(services.notifications, 'Notification', 'notifications'),
  activityLogs: buildCrudController(services.activityLogs, 'Activity log', 'activity_logs')
};
