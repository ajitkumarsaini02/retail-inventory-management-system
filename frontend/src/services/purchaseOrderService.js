import api from './api';

export const purchaseOrderService = {
  getAllPurchaseOrders: async () => {
    const response = await api.get('/api/purchase-orders');
    return response.data;
  },

  getPurchaseOrderById: async (id) => {
    const response = await api.get(`/api/purchase-orders/${id}`);
    return response.data;
  },

  getPurchaseOrderByNumber: async (purchaseOrderNumber) => {
    const response = await api.get(`/api/purchase-orders/number/${purchaseOrderNumber}`);
    return response.data;
  },

  getPurchaseOrdersBySupplierId: async (supplierId) => {
    const response = await api.get(`/api/purchase-orders/supplier/${supplierId}`);
    return response.data;
  },

  getPurchaseOrdersByStatus: async (status) => {
    const response = await api.get(`/api/purchase-orders/status/${status}`);
    return response.data;
  },

  checkAvailability: async (id) => {
    const response = await api.get(`/api/purchase-orders/${id}/availability`);
    return response.data;
  },

  createPurchaseOrder: async (purchaseOrderData) => {
    const response = await api.post('/api/purchase-orders', purchaseOrderData);
    return response.data;
  },

  updatePurchaseOrder: async (id, purchaseOrderData) => {
    const response = await api.put(`/api/purchase-orders/${id}`, purchaseOrderData);
    return response.data;
  },

  deletePurchaseOrder: async (id) => {
    const response = await api.delete(`/api/purchase-orders/${id}`);
    return response.data;
  },
};

export default purchaseOrderService;
