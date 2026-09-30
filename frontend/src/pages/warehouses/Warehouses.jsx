import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Warehouse as WarehouseIcon, RefreshCw, X } from 'lucide-react';
import warehouseService from '../../services/warehouseService';
import WarehouseTable from '../../components/warehouse/WarehouseTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const Warehouses = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // View modal
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data || []);
    } catch (err) {
      setError('Failed to fetch warehouses: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleEdit = (id) => {
    navigate(`/warehouses/edit/${id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await warehouseService.deleteWarehouse(deleteTarget.id);
      setToast({ message: `Warehouse "${deleteTarget.name}" deleted successfully.`, type: 'success' });
      setDeleteTarget(null);
      fetchWarehouses();
    } catch (err) {
      setToast({
        message: 'Could not delete warehouse. ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Warehouse Locations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Distribution centers, capacity monitoring, and facilities</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWarehouses}
            title="Refresh"
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button
              onClick={() => navigate('/warehouses/add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchWarehouses} onDismiss={() => setError('')} />

      <WarehouseTable
        warehouses={warehouses}
        isLoading={isLoading}
        onView={(wh) => setSelectedWarehouse(wh)}
        onEdit={handleEdit}
        onDelete={(wh) => setDeleteTarget(wh)}
      />

      {/* Details View Modal */}
      {selectedWarehouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <WarehouseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedWarehouse.name}</h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Code: {selectedWarehouse.code}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Address</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {selectedWarehouse.address}, {selectedWarehouse.city}, {selectedWarehouse.state} -{' '}
                  {selectedWarehouse.pincode}, {selectedWarehouse.country}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Contact Person</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedWarehouse.contactPerson || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedWarehouse.contactNumber || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedWarehouse.email || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Capacity</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedWarehouse.capacity ? Number(selectedWarehouse.capacity).toLocaleString() : 'N/A'} Units
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Warehouse"
        message={`Are you sure you want to delete warehouse "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Warehouses;
