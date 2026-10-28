import api from './axios.js';

export const ordersApi = {
  createOrder: async ({ serviceId, notes, paymentMethod }) => {
    const res = await api.post('/orders', { serviceId, notes, paymentMethod });
    return res.data;
  },

  getMyPurchases: async () => {
    const res = await api.get('/orders/my-purchases');
    return res.data;
  },

  getMySales: async () => {
    const res = await api.get('/orders/my-sales');
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
};
