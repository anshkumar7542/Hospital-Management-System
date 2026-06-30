const uploadTypes = {
  medical_report: {
    directory: 'medical-reports',
    label: 'Medical report'
  },
  prescription: {
    directory: 'prescriptions',
    label: 'Prescription'
  },
  bill: {
    directory: 'bills',
    label: 'Bill'
  },
  patient_document: {
    directory: 'patient-documents',
    label: 'Patient document'
  }
};

const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx']);

const allowedMimeTypes = new Map([
  ['.pdf', new Set(['application/pdf'])],
  ['.jpg', new Set(['image/jpeg'])],
  ['.jpeg', new Set(['image/jpeg'])],
  ['.png', new Set(['image/png'])],
  ['.webp', new Set(['image/webp'])],
  ['.doc', new Set(['application/msword'])],
  ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])]
]);

module.exports = { uploadTypes, allowedExtensions, allowedMimeTypes };
