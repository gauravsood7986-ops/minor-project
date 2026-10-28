import api from './axios.js';

export const servicesApi = {
  getServices: async (params = {}) => {
    const res = await api.get('/services', { params });
    return res.data;
  },

  getServiceById: async (id) => {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },

  createService: async (data) => {
    const res = await api.post('/services', data);
    return res.data;
  },

  updateService: async (id, data) => {
    const res = await api.patch(`/services/${id}`, data);
    return res.data;
  },

  deleteService: async (id) => {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  },

  getMyServices: async () => {
    const res = await api.get('/services/mine');
    return res.data;
  },

  updateServiceStatus: async (id, status) => {
    const res = await api.patch(`/services/${id}/status`, { status });
    return res.data;
  },
};
