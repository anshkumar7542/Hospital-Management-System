const PRODUCTION_BACKEND_URL = 'https://hospital-management-system-gupl.onrender.com';
const BAD_RENDER_HOSTS = new Set(['hms-backend.onrender.com']);

const cleanUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const isBadRenderUrl = (value) => {
  try {
    return BAD_RENDER_HOSTS.has(new URL(value).host);
  } catch {
    return false;
  }
};

export const getBackendUrl = (value) => {
  const configured = cleanUrl(value);
  if (!configured || isBadRenderUrl(configured)) return PRODUCTION_BACKEND_URL;
  return configured;
};

export const getApiBaseUrl = (value) => {
  const configured = cleanUrl(value);
  if (!configured || isBadRenderUrl(configured)) return `${PRODUCTION_BACKEND_URL}/api/v1`;
  return configured;
};
