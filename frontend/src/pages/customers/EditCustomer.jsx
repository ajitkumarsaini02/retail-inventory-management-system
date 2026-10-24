import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerForm from '../../components/customer/CustomerForm';
import customerService from '../../services/customerService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const data = await customerService.getCustomerById(id);
        setCustomer(data);
      } catch (err) {
        setError('Failed to load customer profile: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      setIsSubmitting(true);
      await customerService.updateCustomer(id, data);
      setToast({ message: 'Customer updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/customers');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to update customer: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Fetching customer details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CustomerForm initialData={customer} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default EditCustomer;
