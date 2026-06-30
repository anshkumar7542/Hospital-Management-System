import { apiClient } from './apiClient.js';

export const resourceEndpoints = {
  doctors: '/doctors',
  patients: '/patients',
  appointments: '/appointments',
  records: '/medical-records',
  billing: '/billing',
  payments: '/payments',
  medicines: '/medicines',
  departments: '/departments',
  activity: '/activity-logs',
  notifications: '/notifications'
};

export const resourceService = {
  async list(type, params) {
    const endpoint = resourceEndpoints[type];
    const { data } = await apiClient.get(endpoint, { params });
    return { rows: data.data || [], meta: data.meta };
  },
  async create(type, payload) {
    const endpoint = resourceEndpoints[type];
    const { data } = await apiClient.post(endpoint, payload);
    return data.data;
  },
  async update(type, id, payload) {
    const endpoint = resourceEndpoints[type];
    const { data } = await apiClient.patch(`${endpoint}/${id}`, payload);
    return data.data;
  },
  async remove(type, id) {
    const endpoint = resourceEndpoints[type];
    const { data } = await apiClient.delete(`${endpoint}/${id}`);
    return data;
  }
};
