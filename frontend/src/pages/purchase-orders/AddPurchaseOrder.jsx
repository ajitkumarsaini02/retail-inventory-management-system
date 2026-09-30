import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseOrderForm from '../../components/purchase/PurchaseOrderForm';
import purchaseOrderService from '../../services/purchaseOrderService';
import supplierService from '../../services/supplierService';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';

const AddPurchaseOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [suppData, prodData] = await Promise.all([
          supplierService.getAllSuppliers(),
          productService.getAllProducts(),
        ]);
        setSuppliers(suppData || []);
        setProducts(prodData || []);
      } catch (err) {
        setError('Failed to load suppliers or products: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (orderData) => {
    try {
      setIsSubmitting(true);
      await purchaseOrderService.createPurchaseOrder(orderData);
      setToast({ message: 'Purchase order created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/purchase-orders');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to create purchase order: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Preparing procurement form..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <PurchaseOrderForm
        suppliers={suppliers}
        products={products}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AddPurchaseOrder;
