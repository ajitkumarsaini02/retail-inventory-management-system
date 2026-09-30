import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarehouseForm from '../../components/warehouse/WarehouseForm';
import warehouseService from '../../services/warehouseService';
import Toast from '../../components/common/Toast';

const AddWarehouse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleCreate = async (data) => {
    try {
      setIsSubmitting(true);
      await warehouseService.createWarehouse(data);
      setToast({ message: 'Warehouse created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/warehouses');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to create warehouse: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <WarehouseForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default AddWarehouse;
