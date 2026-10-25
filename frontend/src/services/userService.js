import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.patch(`/api/users/${id}/toggle-status`);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/api/users/change-password', passwordData);
    return response.data;
  },
};

export default userService;
