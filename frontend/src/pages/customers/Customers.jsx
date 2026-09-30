import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, RefreshCw, X, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react';
import customerService from '../../services/customerService';
import CustomerTable from '../../components/customer/CustomerTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const Customers = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // View modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await customerService.getAllCustomers();
      setCustomers(data || []);
    } catch (err) {
      setError('Failed to fetch customers: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (id) => {
    navigate(`/customers/edit/${id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await customerService.deleteCustomer(deleteTarget.id);
      setToast({ message: `Customer "${deleteTarget.name}" deleted successfully.`, type: 'success' });
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      setToast({
        message: 'Could not delete customer: ' + (err.response?.data?.message || err.message),
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage buyer profiles, addresses, and order communication</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            title="Refresh"
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/customers/add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 dark:shadow-none transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchCustomers} onDismiss={() => setError('')} />

      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onView={(cust) => setSelectedCustomer(cust)}
        onEdit={handleEdit}
        onDelete={(cust) => setDeleteTarget(cust)}
      />

      {/* View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150 border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Customer ID: #{selectedCustomer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedCustomer.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>SHIPPING ADDRESS</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200">
                  {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} -{' '}
                  {selectedCustomer.pincode}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedCustomer.country || 'India'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => navigate(`/orders/add?customerId=${selectedCustomer.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Create Order</span>
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer"
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
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any active orders linked may be affected.`}
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

export default Customers;
