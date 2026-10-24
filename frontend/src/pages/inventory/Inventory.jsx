import React, { useState, useEffect } from 'react';
import { Plus, Boxes, RefreshCw } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';
import warehouseService from '../../services/warehouseService';
import InventoryTable from '../../components/inventory/InventoryTable';
import InventoryForm from '../../components/inventory/InventoryForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [invData, prodData, whData] = await Promise.all([
        inventoryService.getAllInventory(),
        productService.getAllProducts(),
        warehouseService.getAllWarehouses(),
      ]);
      setInventory(invData || []);
      setProducts(prodData || []);
      setWarehouses(whData || []);
    } catch (err) {
      setError('Failed to fetch inventory data: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      if (editingItem) {
        await inventoryService.updateInventory(editingItem.id, payload);
        setToast({ message: 'Inventory updated successfully.', type: 'success' });
      } else {
        await inventoryService.createInventory(payload);
        setToast({ message: 'Stock allocated successfully.', type: 'success' });
      }
      setIsFormOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      setToast({
        message: 'Inventory operation failed: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await inventoryService.deleteInventory(deleteTarget.id);
      setToast({ message: 'Stock allocation removed successfully.', type: 'success' });
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setToast({
        message: 'Could not delete stock record: ' + (err.response?.data?.message || err.message),
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Warehouse stock counts, reserved units, and reorder levels</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock</span>
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchData} onDismiss={() => setError('')} />

      <InventoryTable
        inventory={inventory}
        products={products}
        warehouses={warehouses}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(item) => setDeleteTarget(item)}
      />

      {/* Add / Edit Inventory Modal */}
      {isFormOpen && (
        <InventoryForm
          initialData={editingItem}
          products={products}
          warehouses={warehouses}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Stock Allocation"
        message={`Are you sure you want to remove stock for "${deleteTarget?.product?.name}" from "${deleteTarget?.warehouse?.name}"?`}
        confirmText="Yes, Remove"
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

export default Inventory;
