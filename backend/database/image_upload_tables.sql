ALTER TABLE uploads
  ADD COLUMN entity_type ENUM('user', 'doctor', 'patient', 'hospital') NULL AFTER medical_record_id,
  ADD COLUMN entity_id BIGINT UNSIGNED NULL AFTER entity_type;

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

CREATE INDEX idx_uploads_entity ON uploads (entity_type, entity_id);
CREATE INDEX idx_uploads_image_type_entity ON uploads (upload_type, entity_type, entity_id);
