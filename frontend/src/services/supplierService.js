import api from './api';

export const supplierService = {
  getAllSuppliers: async () => {
    const response = await api.get('/api/suppliers');
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`/api/suppliers/${id}`);
    return response.data;
  },

  checkAvailability: async (id) => {
    const response = await api.get(`/api/suppliers/${id}/availability`);
    return response.data;
  },

  createSupplier: async (supplierData) => {
    const response = await api.post('/api/suppliers', supplierData);
    return response.data;
  },

  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/api/suppliers/${id}`, supplierData);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`/api/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
