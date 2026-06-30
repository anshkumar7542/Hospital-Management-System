const repositories = require('../repositories/domain.repositories');
const { buildCrudService } = require('./crud.service');
const ApiError = require('../utils/ApiError');
const { query } = require('../config/db');
const { getIo } = require('../config/socket');
const { SOCKET_EVENTS } = require('../constants/socketEvents');
const { emitDashboardUpdate, emitToRoles, emitToUser } = require('./realtime/socketEmitter.service');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const env = require('../config/env');
const { uploadTypes } = require('../constants/upload.constants');
const { imageUploadTypes } = require('../constants/imageUpload.constants');
const { deleteUploadedFile } = require('../utils/fileStorage');

const services = {
  departments: buildCrudService(repositories.departments, 'Department'),
  doctors: buildCrudService(repositories.doctors, 'Doctor'),
  patients: buildCrudService(repositories.patients, 'Patient'),
  medicalRecords: buildCrudService(repositories.medicalRecords, 'Medical record'),
  billing: buildCrudService(repositories.billing, 'Billing record'),
  payments: buildCrudService(repositories.payments, 'Payment'),
  medicines: buildCrudService(repositories.medicines, 'Medicine'),
  prescriptions: buildCrudService(repositories.prescriptions, 'Prescription'),
  prescriptionItems: buildCrudService(repositories.prescriptionItems, 'Prescription item'),
  uploads: buildCrudService(repositories.uploads, 'Upload'),
  notifications: buildCrudService(repositories.notifications, 'Notification'),
  activityLogs: buildCrudService(repositories.activityLogs, 'Activity log')
};

services.appointments = {
  ...buildCrudService(repositories.appointments, 'Appointment'),
  async create(payload) {
    const conflicts = await query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('cancelled', 'no_show')
       AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
       LIMIT 1`,
      [payload.doctor_id, payload.appointment_date, payload.end_time, payload.start_time, payload.start_time, payload.start_time]
    );
    if (conflicts.length) throw new ApiError(409, 'Doctor already has an appointment in this time slot');

    const appointment = await repositories.appointments.create(payload);
    emitToRoles(['Admin', 'Doctor', 'Receptionist'], SOCKET_EVENTS.APPOINTMENT_CREATED, appointment);
    emitDashboardUpdate('appointment_created', appointment);
    return appointment;
  },
  async updateStatus(id, status, userId) {
    const appointment = await repositories.appointments.updateById(id, {
      status,
      cancelled_by: status === 'cancelled' ? userId : undefined,
      cancelled_at: status === 'cancelled' ? new Date() : undefined
    });
    emitToRoles(['Admin', 'Doctor', 'Receptionist'], SOCKET_EVENTS.APPOINTMENT_STATUS_CHANGED, appointment);
    emitDashboardUpdate('appointment_status_changed', appointment);

    if (status === 'checked_in') {
      emitToRoles(['Admin', 'Doctor', 'Receptionist'], SOCKET_EVENTS.PATIENT_CHECKED_IN, appointment);
      emitDashboardUpdate('patient_checked_in', appointment);
    }

    return appointment;
  }
};

services.doctors.update = async (id, payload) => {
  const doctor = await repositories.doctors.updateById(id, payload);
  if (payload.availability_status !== undefined) {
    emitToRoles(['Admin', 'Doctor', 'Receptionist'], SOCKET_EVENTS.DOCTOR_STATUS_UPDATED, doctor);
    emitDashboardUpdate('doctor_status_updated', doctor);
  }
  return doctor;
};

services.billing.create = async (payload) => {
  const bill = await repositories.billing.create(payload);
  emitToRoles(['Admin', 'Receptionist'], SOCKET_EVENTS.BILLING_CREATED, bill);
  emitDashboardUpdate('billing_created', bill);
  return bill;
};

services.billing.update = async (id, payload) => {
  const bill = await repositories.billing.updateById(id, payload);
  emitToRoles(['Admin', 'Receptionist'], SOCKET_EVENTS.BILLING_UPDATED, bill);
  emitDashboardUpdate('billing_updated', bill);
  return bill;
};

services.payments.create = async (payload) => {
  const payment = await repositories.payments.create(payload);
  emitToRoles(['Admin', 'Receptionist'], SOCKET_EVENTS.PAYMENT_CREATED, payment);
  emitDashboardUpdate('payment_created', payment);
  return payment;
};

services.notifications.create = async (payload) => {
  const notification = await repositories.notifications.create(payload);
  emitToUser(notification.user_id, SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  emitDashboardUpdate('notification_created', notification);
  return notification;
};

services.uploads.createFromFile = async (file, body, userId) => {
  const uploadType = uploadTypes[body.upload_type] ? body.upload_type : 'patient_document';
  const directory = uploadTypes[uploadType].directory;
  const relativePath = `${directory}/${file.filename}`;
  const finalPath = path.join(env.uploadDir, relativePath);

  await fs.mkdir(path.dirname(finalPath), { recursive: true });
  await fs.rename(file.path, finalPath);

  try {
    return await repositories.uploads.create({
      patient_id: body.patient_id || null,
      medical_record_id: body.medical_record_id || null,
      uploaded_by: userId,
      file_name: relativePath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      file_url: `/uploads/${relativePath}`,
      upload_type: uploadType,
      visibility: body.visibility || 'private'
    });
  } catch (error) {
    await deleteUploadedFile(relativePath);
    throw error;
  }
};

const processImage = async (file, imageType) => {
  const config = imageUploadTypes[imageType];
  if (!config) throw new ApiError(400, 'Invalid image_type');

  const metadata = await sharp(file.buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new ApiError(415, 'Invalid image file');
  }

  const buffer = await sharp(file.buffer, { failOn: 'warning' })
    .rotate()
    .resize({
      width: config.width,
      height: config.height,
      fit: config.fit,
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
  const relativePath = `${config.directory}/${filename}`;
  const finalPath = path.join(env.uploadDir, relativePath);

  await fs.mkdir(path.dirname(finalPath), { recursive: true });
  await fs.writeFile(finalPath, buffer, { flag: 'wx' });

  return {
    relativePath,
    fileUrl: `/uploads/${relativePath}`,
    mimeType: 'image/webp',
    fileSize: buffer.length,
    width: config.width,
    height: config.height
  };
};

services.uploads.createImageFromFile = async (file, body, userId) => {
  const imageType = body.image_type;
  const processed = await processImage(file, imageType);

  try {
    return await repositories.uploads.create({
      patient_id: body.entity_type === 'patient' ? body.entity_id : null,
      medical_record_id: null,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      uploaded_by: userId,
      file_name: processed.relativePath,
      original_name: file.originalname,
      mime_type: processed.mimeType,
      file_size: processed.fileSize,
      file_url: processed.fileUrl,
      upload_type: imageType,
      visibility: body.visibility || 'staff_only'
    });
  } catch (error) {
    await deleteUploadedFile(processed.relativePath);
    throw error;
  }
};

services.uploads.replaceImageFromFile = async (id, file, body) => {
  const existing = await services.uploads.get(id);
  if (!imageUploadTypes[existing.upload_type]) {
    throw new ApiError(400, 'Upload is not an image resource');
  }

  const imageType = body.image_type || existing.upload_type;
  const entityType = body.entity_type || existing.entity_type;
  const entityId = body.entity_id || existing.entity_id;
  const processed = file ? await processImage(file, imageType) : null;

  try {
    const updated = await repositories.uploads.updateById(id, {
      patient_id: entityType === 'patient' ? entityId : null,
      entity_type: entityType,
      entity_id: entityId,
      file_name: processed?.relativePath,
      original_name: file?.originalname,
      mime_type: processed?.mimeType,
      file_size: processed?.fileSize,
      file_url: processed?.fileUrl,
      upload_type: imageType,
      visibility: body.visibility || existing.visibility
    });

    if (processed) await deleteUploadedFile(existing.file_name);
    return updated;
  } catch (error) {
    if (processed) await deleteUploadedFile(processed.relativePath);
    throw error;
  }
};

services.uploads.remove = async (id) => {
  const record = await services.uploads.get(id);
  await deleteUploadedFile(record.file_name);
  await repositories.uploads.removeById(id);
};

services.uploads.update = async (id, payload) => {
  await services.uploads.get(id);
  return repositories.uploads.updateById(id, {
    patient_id: payload.patient_id,
    medical_record_id: payload.medical_record_id,
    entity_type: payload.entity_type,
    entity_id: payload.entity_id,
    visibility: payload.visibility
  });
};

module.exports = services;
