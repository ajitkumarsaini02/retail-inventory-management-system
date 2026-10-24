import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OrderForm from '../../components/order/OrderForm';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import Loading from '../../components/common/Loading';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';

const AddOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setIsLoading(true);
        const [cData, pData] = await Promise.all([
          customerService.getAllCustomers(),
          productService.getAllProducts(),
        ]);
        setCustomers(cData || []);
        setProducts(pData || []);
      } catch (err) {
        setError('Failed to load customers or products: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    loadPrerequisites();
  }, []);

  const handleCreateOrder = async (orderPayload) => {
    try {
      setIsSubmitting(true);
      const created = await orderService.createOrder(orderPayload);
      setToast({ message: 'Order submitted successfully!', type: 'success' });
      setTimeout(() => {
        navigate(`/orders/${created.id}`);
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Order creation failed: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Preparing order checkout..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      <OrderForm
        customers={customers}
        products={products}
        initialCustomerId={initialCustomerId}
        onCustomerCreated={(newCust) => setCustomers((prev) => [...prev, newCust])}
        onSubmit={handleCreateOrder}
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

export default AddOrder;
