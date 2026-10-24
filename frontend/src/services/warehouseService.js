import api from './api';

export const warehouseService = {
  getAllWarehouses: async () => {
    const response = await api.get('/api/warehouses');
    return response.data;
  },

  getWarehouseById: async (id) => {
    const response = await api.get(`/api/warehouses/${id}`);
    return response.data;
  },

  checkAvailability: async (id) => {
    const response = await api.get(`/api/warehouses/${id}/availability`);
    return response.data;
  },

  createWarehouse: async (warehouseData) => {
    const response = await api.post('/api/warehouses', warehouseData);
    return response.data;
  },

  updateWarehouse: async (id, warehouseData) => {
    const response = await api.put(`/api/warehouses/${id}`, warehouseData);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await api.delete(`/api/warehouses/${id}`);
    return response.data;
  },
};

export default warehouseService;
