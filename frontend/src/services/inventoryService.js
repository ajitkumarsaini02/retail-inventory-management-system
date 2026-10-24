import api from './api';

export const inventoryService = {
  getAllInventory: async () => {
    const response = await api.get('/api/inventory');
    return response.data;
  },

  getInventoryById: async (id) => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },

  getInventoryByProductId: async (productId) => {
    const response = await api.get(`/api/inventory/product/${productId}`);
    return response.data;
  },

  getInventoryByWarehouseId: async (warehouseId) => {
    const response = await api.get(`/api/inventory/warehouse/${warehouseId}`);
    return response.data;
  },

  getInventoryByProductAndWarehouse: async (productId, warehouseId) => {
    const response = await api.get(`/api/inventory/product/${productId}/warehouse/${warehouseId}`);
    return response.data;
  },

  checkAvailability: async (id) => {
    const response = await api.get(`/api/inventory/${id}/availability`);
    return response.data;
  },

  createInventory: async (inventoryData) => {
    const response = await api.post('/api/inventory', inventoryData);
    return response.data;
  },

  updateInventory: async (id, inventoryData) => {
    const response = await api.put(`/api/inventory/${id}`, inventoryData);
    return response.data;
  },

  deleteInventory: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },
};

export default inventoryService;
