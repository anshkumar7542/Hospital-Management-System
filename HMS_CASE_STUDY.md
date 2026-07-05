# HMS Case Study: End-to-End Hospital Workflow

## Project Title
Hospital Management System (HMS) - Role-Based Clinical and Administrative Workflow

## Objective
To verify that the Hospital Management System works like a real hospital environment where patients, doctors, receptionists, nurses, pharmacists, lab technicians, and admins can perform their tasks securely and in the correct workflow.

## Business Scenario
A hospital needs a digital system to manage patient registration, appointment booking, doctor consultation, laboratory tests, pharmacy dispensing, billing, admission, discharge, and reporting. The system must support multiple roles with role-based access and secure medical data handling.

## Actors
- Super Admin
- Admin
- Receptionist
- Doctor
- Nurse
- Patient
- Pharmacist
- Lab Technician

## Core Workflow
1. Patient registers and logs in.
2. Receptionist books an appointment.
3. Doctor reviews patient history and consults the patient.
4. Lab tests are requested if needed.
5. Pharmacy dispenses prescribed medicines.
6. Billing and payment are completed.
7. Admission and discharge are handled if required.
8. Reports and notifications are generated.

## Case Study 1: Patient Appointment Flow
### Scenario
A new patient wants to book a consultation for a general checkup.

### Steps
1. The patient registers an account.
2. The patient logs in.
3. The patient selects a department and doctor.
4. The patient chooses a date and time slot.
5. The appointment request is submitted.
6. The receptionist reviews and confirms the appointment.
7. The patient receives a confirmation notification.

### Expected Result
- The appointment is created successfully.
- The system prevents double booking.
- The patient can see the appointment status.
- The receptionist can manage the schedule.

## Case Study 2: Doctor Consultation Flow
### Scenario
A doctor receives a scheduled appointment and needs to review the patient before consultation.

### Steps
1. The doctor logs in.
2. The doctor opens the appointment queue.
3. The doctor reviews patient history, allergies, previous prescriptions, and reports.
4. The doctor records symptoms, diagnosis, and treatment plan.
5. The doctor adds medicines and follow-up instructions.
6. The doctor requests lab tests if required.

### Expected Result
- The doctor can access complete patient information.
- The consultation is stored in the medical record.
- Prescriptions and lab requests are created correctly.

## Case Study 3: Laboratory Test Flow
### Scenario
A doctor prescribes a blood test for a patient.

### Steps
1. The doctor sends a lab request.
2. The lab technician receives the request.
3. The technician updates the test status from Requested to Sample Collected.
4. The test is processed and marked Completed.
5. The report is uploaded.
6. The doctor and patient receive notification.

### Expected Result
- The lab request is visible to the technician.
- The report is uploaded successfully.
- Status updates are correct.

## Case Study 4: Pharmacy Dispensing Flow
### Scenario
A patient receives a prescription and needs medicine.

### Steps
1. The pharmacist receives the prescription.
2. The pharmacist checks stock and expiry date.
3. The pharmacist dispenses the medicine.
4. The stock gets updated.
5. A dispensing record is created.

### Expected Result
- Medicines are issued correctly.
- Stock levels are reduced.
- Expired medicines are not issued.

## Case Study 5: Admission and Discharge Flow
### Scenario
A patient needs to be admitted for observation and treatment.

### Steps
1. The doctor requests admission.
2. The receptionist assigns a room and bed.
3. The nurse monitors the patient.
4. The doctor updates the treatment plan.
5. The patient is discharged.
6. The bed becomes available again.

### Expected Result
- The patient is admitted successfully.
- The bed is marked occupied during admission.
- The bed becomes available after discharge.

## Case Study 6: Billing and Payment Flow
### Scenario
The consultation, tests, medicines, and room charges must be billed.

### Steps
1. The billing module generates the invoice.
2. The patient selects a payment method.
3. The payment is recorded.
4. The invoice status is updated.

### Expected Result
- A complete invoice is created.
- Payment status updates to Paid or Partially Paid.
- Billing details are stored securely.

## Case Study 7: Security and Access Control
### Scenario
Different roles try to access system features based on their responsibilities.

### Steps
1. A patient tries to access staff-only billing screens.
2. A receptionist tries to access doctor prescription editing.
3. A doctor tries to access admin settings.

### Expected Result
- Unauthorized access is blocked.
- The system shows a permission error.
- Only authorized users can view sensitive modules.

## Success Criteria
The system is considered successful if:
- all roles can perform their assigned tasks,
- the workflow is logical and complete,
- medical records and payments are stored correctly,
- access restrictions work properly,
- notifications and reports are generated as expected.
