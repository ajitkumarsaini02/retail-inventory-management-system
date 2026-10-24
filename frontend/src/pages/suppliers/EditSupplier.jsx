import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SupplierForm from '../../components/supplier/SupplierForm';
import supplierService from '../../services/supplierService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';

const EditSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        const data = await supplierService.getSupplierById(id);
        setSupplier(data);
      } catch (err) {
        setError('Failed to load supplier details: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      setIsSubmitting(true);
      await supplierService.updateSupplier(id, data);
      setToast({ message: 'Supplier profile updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/suppliers');
      }, 1000);
    } catch (err) {
      setToast({
        message: 'Failed to update supplier: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Fetching supplier profile..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/suppliers')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SupplierForm initialData={supplier} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default EditSupplier;
