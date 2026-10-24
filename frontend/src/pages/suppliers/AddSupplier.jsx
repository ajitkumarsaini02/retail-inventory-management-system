import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierForm from '../../components/supplier/SupplierForm';
import supplierService from '../../services/supplierService';
import Toast from '../../components/common/Toast';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleCreate = async (data) => {
    try {
      setIsSubmitting(true);
      await supplierService.createSupplier(data);
      setToast({ message: 'Supplier created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/suppliers');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to register supplier: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SupplierForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AddSupplier;
