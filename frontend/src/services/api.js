import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const patientApi = {
  list: (params) => api.get('/patients', { params }),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  remove: (id) => api.delete(`/patients/${id}`),
  assignDoctor: (id, doctorId) => api.patch(`/patients/${id}/assign-doctor`, { doctorId }),
  addVisit: (id, data) => api.post(`/patients/${id}/visits`, data),
  uploadReport: (id, formData) => api.post(`/patients/${id}/reports`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const doctorApi = {
  list: (params) => api.get('/doctors', { params }),
  get: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  remove: (id) => api.delete(`/doctors/${id}`),
  availability: (id, data) => api.patch(`/doctors/${id}/availability`, data),
  assignPatient: (id, patientId) => api.patch(`/doctors/${id}/assign-patient`, { patientId }),
};

export const appointmentApi = {
  list: (params) => api.get('/appointments', { params }),
  create: (data) => api.post('/appointments', data),
  availableSlots: (doctorId, params) => api.get(`/appointments/slots/${doctorId}`, { params }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  reschedule: (id, data) => api.patch(`/appointments/${id}/slot`, data),
};

export const prescriptionApi = {
  create: (data) => api.post('/prescriptions', data),
  listByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
};

export const invoiceApi = {
  list: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
  markPaid: (id, data) => api.patch(`/invoices/${id}/pay`, data),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
