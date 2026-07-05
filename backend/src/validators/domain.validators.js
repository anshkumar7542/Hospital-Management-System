const { body } = require('express-validator');

const optionalText = (field) => body(field).optional({ nullable: true }).isString().trim();
const requiredText = (field, message) => body(field).isString().trim().notEmpty().withMessage(message);
const optionalInt = (field) => body(field).optional({ nullable: true }).isInt({ min: 1 }).withMessage(`${field} must be a positive integer`);
const requiredInt = (field) => body(field).isInt({ min: 1 }).withMessage(`Valid ${field} is required`);
const optionalMoney = (field) => body(field).optional({ nullable: true }).isFloat({ min: 0 }).withMessage(`${field} must be non-negative`);

const timeRule = (field) =>
  body(field).matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).withMessage(`Valid ${field} is required`);

const optionalTimeRule = (field) =>
  body(field).optional({ nullable: true }).matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).withMessage(`Valid ${field} is required`);

const departments = {
  create: [
    requiredText('name', 'Department name is required'),
    optionalText('description'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid department status')
  ],
  update: [
    optionalText('name').notEmpty().withMessage('Department name cannot be empty'),
    optionalText('description'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid department status')
  ]
};

const doctors = {
  create: [
    requiredInt('user_id'),
    requiredInt('department_id'),
    requiredText('license_number', 'License number is required'),
    requiredText('specialization', 'Specialization is required'),
    optionalText('qualification'),
    optionalMoney('consultation_fee'),
    body('availability_status').optional().isIn(['available', 'unavailable', 'on_leave']).withMessage('Invalid availability status')
  ],
  update: [
    optionalInt('user_id'),
    optionalInt('department_id'),
    optionalText('license_number').notEmpty().withMessage('License number cannot be empty'),
    optionalText('specialization').notEmpty().withMessage('Specialization cannot be empty'),
    optionalText('qualification'),
    optionalMoney('consultation_fee'),
    body('availability_status').optional().isIn(['available', 'unavailable', 'on_leave']).withMessage('Invalid availability status')
  ]
};

const patients = {
  create: [
    body('user_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid user_id is required'),
    requiredText('patient_code', 'Patient code is required'),
    requiredText('full_name', 'Patient full name is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('date_of_birth').isISO8601().withMessage('Valid date_of_birth is required'),
    body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).withMessage('Invalid blood group'),
    requiredText('phone', 'Phone is required'),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail().withMessage('Valid email is required'),
    optionalText('address'),
    optionalText('emergency_contact_name'),
    optionalText('emergency_contact_phone'),
    optionalText('insurance_provider'),
    optionalText('insurance_policy_number'),
    body('status').optional().isIn(['active', 'inactive', 'deceased']).withMessage('Invalid patient status')
  ],
  update: [
    optionalInt('user_id'),
    optionalText('patient_code').notEmpty().withMessage('Patient code cannot be empty'),
    optionalText('full_name').notEmpty().withMessage('Patient full name cannot be empty'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('date_of_birth').optional().isISO8601().withMessage('Valid date_of_birth is required'),
    body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).withMessage('Invalid blood group'),
    optionalText('phone').notEmpty().withMessage('Phone cannot be empty'),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail().withMessage('Valid email is required'),
    optionalText('address'),
    optionalText('emergency_contact_name'),
    optionalText('emergency_contact_phone'),
    optionalText('insurance_provider'),
    optionalText('insurance_policy_number'),
    body('status').optional().isIn(['active', 'inactive', 'deceased']).withMessage('Invalid patient status')
  ]
};

const appointments = {
  create: [
    body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid patient_id is required'),
    body('doctor_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid doctor_id is required'),
    requiredInt('department_id'),
    body('appointment_date').isISO8601().withMessage('Valid appointment_date is required'),
    timeRule('start_time'),
    timeRule('end_time'),
    body('status').optional().isIn(['pending', 'scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show']).withMessage('Invalid appointment status'),
    optionalText('reason'),
    optionalText('notes')
  ],
  update: [
    optionalInt('patient_id'),
    optionalInt('doctor_id'),
    optionalInt('department_id'),
    body('appointment_date').optional().isISO8601().withMessage('Valid appointment_date is required'),
    optionalTimeRule('start_time'),
    optionalTimeRule('end_time'),
    body('status').optional().isIn(['pending', 'scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show']).withMessage('Invalid appointment status'),
    optionalText('reason'),
    optionalText('notes'),
    optionalText('cancellation_reason')
  ],
  status: [
    body('status').isIn(['pending', 'scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show']).withMessage('Invalid appointment status'),
    body('doctor_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid doctor_id is required')
  ]
};

const medicalRecords = {
  create: [
    body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid patient_id is required'),
    body('doctor_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid doctor_id is required'),
    body('appointment_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid appointment_id is required'),
    requiredText('diagnosis', 'Diagnosis is required'),
    optionalText('symptoms'),
    optionalText('treatment_plan'),
    optionalText('notes')
  ],
  update: [
    optionalInt('patient_id'),
    optionalInt('doctor_id'),
    optionalInt('appointment_id'),
    optionalText('diagnosis').notEmpty().withMessage('Diagnosis cannot be empty'),
    optionalText('symptoms'),
    optionalText('treatment_plan'),
    optionalText('notes')
  ]
};

const billing = {
  create: [
    body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid patient_id is required'),
    body('appointment_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid appointment_id is required'),
    requiredText('invoice_number', 'Invoice number is required'),
    optionalMoney('subtotal'),
    optionalMoney('tax_amount'),
    optionalMoney('discount_amount'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be non-negative'),
    optionalMoney('paid_amount'),
    optionalMoney('balance_amount'),
    body('status').optional().isIn(['draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'refunded']).withMessage('Invalid billing status'),
    body('due_date').optional({ nullable: true }).isISO8601().withMessage('Valid due_date is required'),
    optionalText('notes')
  ],
  update: [
    optionalInt('patient_id'),
    optionalInt('appointment_id'),
    optionalText('invoice_number').notEmpty().withMessage('Invoice number cannot be empty'),
    optionalMoney('subtotal'),
    optionalMoney('tax_amount'),
    optionalMoney('discount_amount'),
    optionalMoney('total_amount'),
    optionalMoney('paid_amount'),
    optionalMoney('balance_amount'),
    body('status').optional().isIn(['draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'refunded']).withMessage('Invalid billing status'),
    body('due_date').optional({ nullable: true }).isISO8601().withMessage('Valid due_date is required'),
    optionalText('notes')
  ]
};

const payments = {
  create: [
    requiredInt('billing_id'),
    body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
    body('payment_method').isIn(['cash', 'card', 'upi', 'bank_transfer', 'insurance']).withMessage('Invalid payment method'),
    optionalText('transaction_reference'),
    body('status').optional().isIn(['pending', 'successful', 'failed', 'refunded']).withMessage('Invalid payment status'),
    body('paid_at').optional({ nullable: true }).isISO8601().withMessage('Valid paid_at is required')
  ],
  update: [
    optionalInt('billing_id'),
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
    body('payment_method').optional().isIn(['cash', 'card', 'upi', 'bank_transfer', 'insurance']).withMessage('Invalid payment method'),
    optionalText('transaction_reference'),
    body('status').optional().isIn(['pending', 'successful', 'failed', 'refunded']).withMessage('Invalid payment status'),
    body('paid_at').optional({ nullable: true }).isISO8601().withMessage('Valid paid_at is required')
  ]
};

const medicines = {
  create: [
    requiredText('name', 'Medicine name is required'),
    optionalText('generic_name'),
    optionalText('category'),
    optionalText('manufacturer'),
    optionalText('batch_number'),
    optionalText('dosage_form'),
    optionalText('strength'),
    optionalMoney('unit_price'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative'),
    body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be non-negative'),
    body('expiry_date').optional({ nullable: true }).isISO8601().withMessage('Valid expiry_date is required'),
    body('status').optional().isIn(['active', 'inactive', 'discontinued']).withMessage('Invalid medicine status')
  ],
  update: [
    optionalText('name').notEmpty().withMessage('Medicine name cannot be empty'),
    optionalText('generic_name'),
    optionalText('category'),
    optionalText('manufacturer'),
    optionalText('batch_number'),
    optionalText('dosage_form'),
    optionalText('strength'),
    optionalMoney('unit_price'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative'),
    body('reorder_level').optional().isInt({ min: 0 }).withMessage('Reorder level must be non-negative'),
    body('expiry_date').optional({ nullable: true }).isISO8601().withMessage('Valid expiry_date is required'),
    body('status').optional().isIn(['active', 'inactive', 'discontinued']).withMessage('Invalid medicine status')
  ]
};

const notifications = {
  create: [
    requiredInt('user_id'),
    requiredText('title', 'Title is required'),
    requiredText('message', 'Message is required'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'appointment', 'billing', 'system']).withMessage('Invalid notification type'),
    body('is_read').optional().isBoolean().withMessage('is_read must be boolean')
  ],
  update: [
    optionalInt('user_id'),
    optionalText('title').notEmpty().withMessage('Title cannot be empty'),
    optionalText('message').notEmpty().withMessage('Message cannot be empty'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'appointment', 'billing', 'system']).withMessage('Invalid notification type'),
    body('is_read').optional().isBoolean().withMessage('is_read must be boolean'),
    body('read_at').optional({ nullable: true }).isISO8601().withMessage('Valid read_at is required')
  ]
};

const prescriptions = {
  create: [
    body('patient_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid patient_id is required'),
    body('appointment_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Valid appointment_id is required'),
    requiredInt('doctor_id')
  ],
  update: [optionalInt('patient_id'), optionalInt('doctor_id'), optionalText('instructions')]
};

const prescriptionItems = {
  create: [
    requiredInt('prescription_id'),
    requiredInt('medicine_id'),
    requiredText('dosage', 'Dosage is required'),
    requiredText('frequency', 'Frequency is required'),
    requiredText('duration', 'Duration is required')
  ],
  update: [
    optionalInt('prescription_id'),
    optionalInt('medicine_id'),
    optionalText('dosage'),
    optionalText('frequency'),
    optionalText('duration'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be positive'),
    optionalText('instructions')
  ]
};

module.exports = {
  departments,
  doctors,
  patients,
  appointments,
  appointmentStatus: appointments.status,
  medicalRecords,
  billing,
  payments,
  medicines,
  prescriptions,
  prescriptionItems,
  notifications
};
