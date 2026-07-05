# HMS End-to-End Test Cases

This checklist is meant for verifying the Hospital Management System workflow step by step.

## 1. Authentication and Role Access
### TC-01: Super Admin login
- Precondition: Super Admin account exists.
- Steps:
  1. Open the login page.
  2. Enter Super Admin credentials.
  3. Login.
- Expected:
  - User is redirected to the dashboard.
  - Full hospital management navigation is visible.
  - Super Admin can access system-level settings.

### TC-02: Admin login
- Steps:
  1. Login as Admin.
  2. Open the dashboard.
- Expected:
  - Admin sees hospital operations data.
  - Staff, departments, appointments, and billing modules are available.

### TC-03: Doctor / Receptionist / Patient login
- Steps:
  1. Login with Doctor, Receptionist, and Patient accounts.
- Expected:
  - Each role sees only relevant modules and actions.
  - Unauthorized modules are hidden or blocked.

---

## 2. Patient Registration and Profile
### TC-04: Patient self-registration
- Steps:
  1. Open the registration page.
  2. Register as a new patient.
  3. Fill in full name, DOB, gender, phone, email, blood group, address, allergies, and emergency contact.
  4. Submit the form.
- Expected:
  - Account is created successfully.
  - Patient can log in.
  - Patient profile is saved.

### TC-05: Patient profile update
- Steps:
  1. Login as patient.
  2. Open profile.
  3. Update phone, address, allergies, and emergency contact.
- Expected:
  - Changes are saved.
  - Updated information is reflected in the dashboard.

---

## 3. Appointment Booking Workflow
### TC-06: Book appointment as patient
- Steps:
  1. Login as patient.
  2. Open appointment booking.
  3. Select a department.
  4. Select a doctor.
  5. Select date and available time slot.
  6. Submit the request.
- Expected:
  - Appointment is created.
  - Status is pending or scheduled based on workflow.
  - Confirmation message appears.

### TC-07: Receptionist confirms or manages appointment
- Steps:
  1. Login as Receptionist.
  2. Open appointments.
  3. Verify the new appointment.
  4. Approve or reschedule it.
- Expected:
  - Appointment status updates.
  - No double booking occurs.
  - Token or queue number is generated if supported.

### TC-08: Doctor approves or rejects appointment
- Steps:
  1. Login as Doctor.
  2. Open the appointment list.
  3. Approve or reject a pending request.
- Expected:
  - Status changes correctly.
  - Doctor can view the patient details for approved appointments.

---

## 4. Doctor Consultation Workflow
### TC-09: Doctor opens patient record before consultation
- Steps:
  1. Login as Doctor.
  2. Open a scheduled appointment.
  3. View patient details and history.
- Expected:
  - Medical history, allergies, previous diagnoses, prescriptions, lab reports, and notes are visible.

### TC-10: Record consultation details
- Steps:
  1. Open a patient consultation.
  2. Enter symptoms, diagnosis, treatment plan, medicines, dosage, instructions, follow-up date, and notes.
  3. Save the consultation.
- Expected:
  - Consultation is stored.
  - Prescription is generated or saved.
  - Medical record is updated.

### TC-11: Doctor requests lab test
- Steps:
  1. Open consultation form.
  2. Request a lab test.
- Expected:
  - Lab request is created.
  - Lab technician can see it in the lab queue.

---

## 5. Nurse Workflow
### TC-12: Nurse records vitals
- Steps:
  1. Login as Nurse.
  2. Open an assigned patient.
  3. Enter temperature, BP, pulse, oxygen level, blood sugar, weight, and notes.
  4. Save.
- Expected:
  - Vitals are stored.
  - Nursing notes are visible to authorized staff.

### TC-13: Nurse monitors admitted patient
- Steps:
  1. Open admitted patient details.
  2. Check assigned room/bed and observation notes.
- Expected:
  - Current patient status is visible.
  - Nurse can update notes without changing billing or prescriptions.

---

## 6. Pharmacy Workflow
### TC-14: Pharmacist checks prescription
- Steps:
  1. Login as Pharmacist.
  2. Open prescription queue.
  3. Review a prescription.
- Expected:
  - Medicines and dosage are visible.
  - Stock data can be checked.

### TC-15: Dispense medicine and update stock
- Steps:
  1. Select a prescription.
  2. Issue medicines.
  3. Confirm the dispensing.
- Expected:
  - Stock quantity decreases.
  - Pharmacy transaction is recorded.
  - Invoice or dispensing record is created.

---

## 7. Laboratory Workflow
### TC-16: Lab technician receives test request
- Steps:
  1. Login as Lab Technician.
  2. Open lab requests.
  3. Select a pending request.
- Expected:
  - Request appears with status Requested.

### TC-17: Update lab test status and upload report
- Steps:
  1. Update status to Sample Collected.
  2. Update to Processing.
  3. Update to Completed.
  4. Upload the report PDF.
- Expected:
  - Status changes correctly.
  - Report is attached.
  - Patient and doctor are notified.

---

## 8. Admission and Bed Management
### TC-18: Admission request and bed assignment
- Steps:
  1. Login as Doctor or Receptionist.
  2. Create an admission request for a patient.
  3. Assign a room and bed.
- Expected:
  - Bed status changes to Occupied.
  - Admission details are saved.

### TC-19: Discharge patient
- Steps:
  1. Open an admitted patient record.
  2. Mark the patient as discharged.
  3. Save discharge summary.
- Expected:
  - Bed becomes Available.
  - Discharge summary is created.

---

## 9. Billing and Payment Workflow
### TC-20: Record consultation and billing
- Steps:
  1. Open a completed appointment.
  2. Record the consultation charge.
  3. Add pharmacy, lab, or room charges if applicable.
- Expected:
  - Invoice is generated with correct totals.
  - Balance and payment status are updated.

### TC-21: Make payment
- Steps:
  1. Open the billing page.
  2. Select a payment method.
  3. Enter amount and complete payment.
- Expected:
  - Payment is recorded.
  - Invoice status becomes Paid or Partially Paid.

---

## 10. Notifications and Reporting
### TC-22: Notification flow
- Steps:
  1. Trigger appointment confirmation, lab report ready, payment success, or discharge update.
- Expected:
  - Notification appears in the app.
  - Email/SMS notification is sent if configured.

### TC-23: Analytics and reports
- Steps:
  1. Open analytics dashboard.
  2. Review daily, weekly, monthly reports.
- Expected:
  - Charts and summary data appear.
  - Reports can be exported if supported.

---

## 11. Security and Audit Checks
### TC-24: Unauthorized access
- Steps:
  1. Try to access a restricted page with an unauthorized role.
- Expected:
  - Access is denied.
  - Secure error message appears.

### TC-25: Audit log check
- Steps:
  1. Perform important actions such as login, update, billing, and delete.
  2. Open audit logs.
- Expected:
  - Entries are recorded with user and timestamp.
