import api, { setStoredCsrfToken } from './axios.js';

export const authApi = {
  getCsrf: async () => {
    const res = await api.get('/auth/csrf');
    if (res.data?.data?.csrfToken) {
      setStoredCsrfToken(res.data.data.csrfToken);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.data?.csrfToken) {
      setStoredCsrfToken(res.data.data.csrfToken);
    }
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.data?.csrfToken) {
      setStoredCsrfToken(res.data.data.csrfToken);
    }
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    setStoredCsrfToken(null);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    if (res.data?.data?.csrfToken) {
      setStoredCsrfToken(res.data.data.csrfToken);
    }
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await api.post('/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  verifyEmail: async (data) => {
    const res = await api.post('/auth/verify-email', data);
    return res.data;
  },
};
