const { buildRepository } = require('./base.repository');

const departments = buildRepository({
  table: 'departments',
  columns: ['name', 'description', 'status', 'created_at', 'updated_at'],
  searchable: ['name']
});

const doctors = buildRepository({
  table: 'doctors',
  columns: ['user_id', 'department_id', 'license_number', 'specialization', 'qualification', 'consultation_fee', 'availability_status', 'created_at', 'updated_at'],
  searchable: ['license_number', 'specialization', 'qualification']
});

const patients = buildRepository({
  table: 'patients',
  columns: ['user_id', 'patient_code', 'full_name', 'gender', 'date_of_birth', 'blood_group', 'phone', 'email', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number', 'status', 'created_at', 'updated_at', 'deleted_at'],
  searchable: ['patient_code', 'full_name', 'phone', 'email']
});

const appointments = buildRepository({
  table: 'appointments',
  columns: ['patient_id', 'doctor_id', 'department_id', 'appointment_date', 'start_time', 'end_time', 'status', 'reason', 'notes', 'created_by', 'cancelled_by', 'cancelled_at', 'cancellation_reason', 'created_at', 'updated_at'],
  searchable: ['reason']
});

const medicalRecords = buildRepository({
  table: 'medical_records',
  columns: ['patient_id', 'doctor_id', 'appointment_id', 'diagnosis', 'symptoms', 'treatment_plan', 'notes', 'record_date', 'created_by', 'created_at', 'updated_at'],
  searchable: ['diagnosis', 'symptoms']
});

const billing = buildRepository({
  table: 'billing',
  columns: ['patient_id', 'appointment_id', 'invoice_number', 'subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'paid_amount', 'balance_amount', 'status', 'due_date', 'notes', 'created_by', 'created_at', 'updated_at'],
  searchable: ['invoice_number']
});

const payments = buildRepository({
  table: 'payments',
  columns: ['billing_id', 'amount', 'payment_method', 'transaction_reference', 'status', 'paid_at', 'received_by', 'created_at', 'updated_at'],
  searchable: ['transaction_reference']
});

const medicines = buildRepository({
  table: 'medicines',
  columns: ['name', 'generic_name', 'category', 'manufacturer', 'batch_number', 'dosage_form', 'strength', 'unit_price', 'stock_quantity', 'reorder_level', 'expiry_date', 'status', 'created_at', 'updated_at'],
  searchable: ['name', 'generic_name', 'category', 'manufacturer']
});

const prescriptions = buildRepository({
  table: 'prescriptions',
  columns: ['patient_id', 'doctor_id', 'appointment_id', 'medical_record_id', 'instructions', 'status', 'prescribed_at', 'created_at', 'updated_at'],
  searchable: ['instructions']
});

const prescriptionItems = buildRepository({
  table: 'prescription_items',
  columns: ['prescription_id', 'medicine_id', 'dosage', 'frequency', 'duration', 'quantity', 'instructions'],
  searchable: ['dosage', 'frequency']
});

const uploads = buildRepository({
  table: 'uploads',
  columns: ['patient_id', 'medical_record_id', 'entity_type', 'entity_id', 'uploaded_by', 'file_name', 'original_name', 'mime_type', 'file_size', 'file_url', 'upload_type', 'visibility', 'created_at'],
  searchable: ['file_name', 'original_name']
});

const notifications = buildRepository({
  table: 'notifications',
  columns: ['user_id', 'title', 'message', 'type', 'is_read', 'read_at', 'created_at'],
  searchable: ['title', 'message']
});

const activityLogs = buildRepository({
  table: 'activity_logs',
  columns: ['user_id', 'action', 'entity_type', 'entity_id', 'description', 'ip_address', 'user_agent', 'created_at'],
  searchable: ['action', 'entity_type', 'description']
});

module.exports = {
  departments,
  doctors,
  patients,
  appointments,
  medicalRecords,
  billing,
  payments,
  medicines,
  prescriptions,
  prescriptionItems,
  uploads,
  notifications,
  activityLogs
};
