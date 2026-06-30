const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const departmentRoutes = require('./department.routes');
const doctorRoutes = require('./doctor.routes');
const patientRoutes = require('./patient.routes');
const appointmentRoutes = require('./appointment.routes');
const medicalRecordRoutes = require('./medicalRecord.routes');
const billingRoutes = require('./billing.routes');
const paymentRoutes = require('./payment.routes');
const medicineRoutes = require('./medicine.routes');
const prescriptionRoutes = require('./prescription.routes');
const prescriptionItemRoutes = require('./prescriptionItem.routes');
const uploadRoutes = require('./upload.routes');
const notificationRoutes = require('./notification.routes');
const activityLogRoutes = require('./activityLog.routes');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/departments', authenticate, departmentRoutes);
router.use('/doctors', authenticate, doctorRoutes);
router.use('/patients', authenticate, patientRoutes);
router.use('/appointments', authenticate, appointmentRoutes);
router.use('/medical-records', authenticate, medicalRecordRoutes);
router.use('/billing', authenticate, billingRoutes);
router.use('/payments', authenticate, paymentRoutes);
router.use('/medicines', authenticate, medicineRoutes);
router.use('/prescriptions', authenticate, prescriptionRoutes);
router.use('/prescription-items', authenticate, prescriptionItemRoutes);
router.use('/uploads', authenticate, uploadRoutes);
router.use('/notifications', authenticate, notificationRoutes);
router.use('/activity-logs', authenticate, activityLogRoutes);

module.exports = router;
