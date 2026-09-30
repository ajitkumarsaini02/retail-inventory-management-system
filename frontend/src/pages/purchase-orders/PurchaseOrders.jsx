import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import purchaseOrderService from '../../services/purchaseOrderService';
import PurchaseOrderTable from '../../components/purchase/PurchaseOrderTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Delete modal target
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPurchaseOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await purchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(data || []);
    } catch (err) {
      setError(
        'Failed to load purchase orders: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleView = (po) => {
    navigate(`/purchase-orders/${po.id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await purchaseOrderService.deletePurchaseOrder(deleteTarget.id);
      setToast({
        message: `Purchase Order "${deleteTarget.purchaseOrderNumber}" deleted successfully.`,
        type: 'success',
      });
      setDeleteTarget(null);
      fetchPurchaseOrders();
    } catch (err) {
      setToast({
        message:
          'Could not delete purchase order: ' +
          (err.response?.data?.message || err.message),
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Purchase Orders
          </h2>
          <p className="text-sm text-slate-500">
            Stock replenishment, supplier procurement orders, and inventory restocking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPurchaseOrders}
            title="Refresh"
            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/purchase-orders/add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchPurchaseOrders} onDismiss={() => setError('')} />

      <PurchaseOrderTable
        purchaseOrders={purchaseOrders}
        isLoading={isLoading}
        onView={handleView}
        onDelete={(po) => setDeleteTarget(po)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Purchase Order"
        message={`Are you sure you want to permanently delete purchase order "${deleteTarget?.purchaseOrderNumber}"?`}
        confirmText="Yes, Delete PO"
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

export default PurchaseOrders;
