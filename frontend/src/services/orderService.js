import api from './api';

export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/api/orders/number/${orderNumber}`);
    return response.data;
  },

  getOrdersByCustomerId: async (customerId) => {
    const response = await api.get(`/api/orders/customer/${customerId}`);
    return response.data;
  },

  getOrdersByStatus: async (status) => {
    const response = await api.get(`/api/orders/status/${status}`);
    return response.data;
  },

  checkAvailability: async (id) => {
    const response = await api.get(`/api/orders/${id}/availability`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await api.put(`/api/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  },
};

export default orderService;
