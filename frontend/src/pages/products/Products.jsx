import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, RefreshCw } from 'lucide-react';
import productService from '../../services/productService';
import ProductTable from '../../components/product/ProductTable';
import ProductCard from '../../components/product/ProductCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const Products = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // View modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Delete modal
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError('Failed to fetch products. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeletePrompt = (product) => {
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(deleteProduct.id);
      setToast({ message: `Product "${deleteProduct.name}" deleted successfully.`, type: 'success' });
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      setToast({
        message: 'Could not delete product. ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Product Catalog</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all items, SKUs, brand catalogs, and prices</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            title="Refresh list"
            className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isAdmin() && (
            <button
              onClick={() => navigate('/products/add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      <ErrorMessage message={error} retry={fetchProducts} onDismiss={() => setError('')} />

      {/* Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
      />

      {/* View Card Modal */}
      <ProductCard
        product={selectedProduct}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete product "${deleteProduct?.name}" (SKU: ${deleteProduct?.sku})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteProduct(null)}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Products;
