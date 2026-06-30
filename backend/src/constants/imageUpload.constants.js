const imageUploadTypes = {
  profile_image: {
    directory: 'profile-images',
    width: 512,
    height: 512,
    fit: 'cover'
  },
  doctor_image: {
    directory: 'doctor-images',
    width: 640,
    height: 640,
    fit: 'cover'
  },
  patient_image: {
    directory: 'patient-images',
    width: 512,
    height: 512,
    fit: 'cover'
  },
  hospital_logo: {
    directory: 'hospital-logos',
    width: 1024,
    height: 512,
    fit: 'inside'
  }
};

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageEntityTypes = ['user', 'doctor', 'patient', 'hospital'];

module.exports = { imageUploadTypes, allowedImageExtensions, allowedImageMimeTypes, imageEntityTypes };
