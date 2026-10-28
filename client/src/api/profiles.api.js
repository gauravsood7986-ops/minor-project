import api from './axios.js';

export const profilesApi = {
  getProfile: async (username) => {
    const res = await api.get(`/profiles/${username}`);
    return res.data;
  },

  updateMyProfile: async (data) => {
    const res = await api.patch('/profiles/me', data);
    return res.data;
  },
};
