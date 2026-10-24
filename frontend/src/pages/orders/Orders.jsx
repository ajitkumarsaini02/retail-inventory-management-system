import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, RefreshCw, X } from 'lucide-react';
import orderService from '../../services/orderService';
import OrderTable from '../../components/order/OrderTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Status Change Modal (for ADMIN)
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('PENDING');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      let data;
      // If user is regular USER, fetch all orders or customer orders
      data = await orderService.getAllOrders();
      setOrders(data || []);
    } catch (err) {
      setError('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleView = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleOpenStatusModal = (order) => {
    setStatusModalOrder(order);
    setNewStatus(order.status || 'PENDING');
  };

  const handleSaveStatus = async () => {
    if (!statusModalOrder) return;
    try {
      setIsUpdatingStatus(true);
      const updated = { ...statusModalOrder, status: newStatus };
      await orderService.updateOrder(statusModalOrder.id, updated);
      setToast({ message: `Order #${statusModalOrder.orderNumber} updated to ${newStatus}.`, type: 'success' });
      setStatusModalOrder(null);
      fetchOrders();
    } catch (err) {
      setToast({
        message: 'Failed to update order status: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await orderService.deleteOrder(deleteTarget.id);
      setToast({ message: `Order #${deleteTarget.orderNumber} deleted successfully.`, type: 'success' });
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      setToast({
        message: 'Could not delete order: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Orders</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track shipments, sales orders, and fulfillment statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            title="Refresh"
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/orders/add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 dark:shadow-none transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchOrders} onDismiss={() => setError('')} />

      <OrderTable
        orders={orders}
        isLoading={isLoading}
        onView={handleView}
        onStatusChange={handleOpenStatusModal}
        onDelete={(order) => setDeleteTarget(order)}
      />

      {/* Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-150 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Order Status</h3>
              <button
                onClick={() => setStatusModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Order: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{statusModalOrder.orderNumber}</span>
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleSaveStatus}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
              >
                {isUpdatingStatus ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order "${deleteTarget?.orderNumber}"?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Orders;
