ALTER TABLE uploads
  MODIFY upload_type ENUM(
    'medical_report',
    'prescription',
    'bill',
    'patient_document',
    'profile_image',
    'doctor_image',
    'patient_image',
    'hospital_logo'
  ) NOT NULL DEFAULT 'patient_document';

CREATE INDEX idx_uploads_visibility ON uploads (visibility);
CREATE INDEX idx_uploads_patient_type ON uploads (patient_id, upload_type);
