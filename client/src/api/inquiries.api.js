import api from './axios.js';

export const inquiriesApi = {
  createInquiry: async (data) => {
    const res = await api.post('/inquiries', data);
    return res.data;
  },

  getSentInquiries: async () => {
    const res = await api.get('/inquiries/sent');
    return res.data;
  },

  getReceivedInquiries: async () => {
    const res = await api.get('/inquiries/received');
    return res.data;
  },

  getInquiryById: async (id) => {
    const res = await api.get(`/inquiries/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/inquiries/${id}/status`, { status });
    return res.data;
  },
};
