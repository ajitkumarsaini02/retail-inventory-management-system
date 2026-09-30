import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import purchaseOrderService from '../../services/purchaseOrderService';
import PurchaseOrderDetailsView from '../../components/purchase/PurchaseOrderDetails';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchPurchaseOrder = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await purchaseOrderService.getPurchaseOrderById(id);
      setPurchaseOrder(data);
    } catch (err) {
      setError(
        'Failed to load purchase order: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!purchaseOrder) return;
    try {
      setIsUpdatingStatus(true);
      const updatedData = {
        ...purchaseOrder,
        status: newStatus,
      };
      const result = await purchaseOrderService.updatePurchaseOrder(id, updatedData);
      setPurchaseOrder(result);
      setToast({
        message: `Purchase order status updated to ${newStatus}.`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message:
          'Failed to update status: ' +
          (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading purchase order details..." />;
  }

  if (error || !purchaseOrder) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error || 'Purchase Order not found.'} />
        <button
          onClick={() => navigate('/purchase-orders')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PurchaseOrderDetailsView
        purchaseOrder={purchaseOrder}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={isUpdatingStatus}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default PurchaseOrderDetailsPage;
