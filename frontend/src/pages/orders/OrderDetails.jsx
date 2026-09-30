import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import orderService from '../../services/orderService';
import OrderDetailsView from '../../components/order/OrderDetails';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return <Loading message="Loading order details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders List</span>
      </button>

      <OrderDetailsView order={order} />
    </div>
  );
};

export default OrderDetailsPage;
