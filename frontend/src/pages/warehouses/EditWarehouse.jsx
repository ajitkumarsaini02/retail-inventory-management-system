import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WarehouseForm from '../../components/warehouse/WarehouseForm';
import warehouseService from '../../services/warehouseService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        const data = await warehouseService.getWarehouseById(id);
        setWarehouse(data);
      } catch (err) {
        setError('Failed to load warehouse details: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      setIsSubmitting(true);
      await warehouseService.updateWarehouse(id, data);
      setToast({ message: 'Warehouse updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/warehouses');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to update warehouse: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Fetching warehouse details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/warehouses')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <WarehouseForm initialData={warehouse} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default EditWarehouse;
