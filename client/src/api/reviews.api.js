import api from './axios.js';

export const reviewsApi = {
  createReview: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  getReviewsByUsername: async (username) => {
    const res = await api.get(`/reviews/${username}`);
    return res.data;
  },
};
