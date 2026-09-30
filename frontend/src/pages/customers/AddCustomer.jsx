import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '../../components/customer/CustomerForm';
import customerService from '../../services/customerService';
import Toast from '../../components/common/Toast';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleCreate = async (data) => {
    try {
      setIsSubmitting(true);
      await customerService.createCustomer(data);
      setToast({ message: 'Customer created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/customers');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to create customer: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CustomerForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AddCustomer;
