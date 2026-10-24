import React, { useState, useEffect } from 'react';
import { Boxes, Save, X } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage';

const InventoryForm = ({ initialData, products, warehouses, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
    reservedQuantity: 0,
    reorderLevel: 10,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.product?.id || '',
        warehouseId: initialData.warehouse?.id || '',
        quantity: initialData.quantity || '',
        reservedQuantity: initialData.reservedQuantity || 0,
        reorderLevel: initialData.reorderLevel || 10,
      });
    } else {
      if (products.length > 0 && !formData.productId) {
        setFormData((prev) => ({ ...prev, productId: products[0].id }));
      }
      if (warehouses.length > 0 && !formData.warehouseId) {
        setFormData((prev) => ({ ...prev, warehouseId: warehouses[0].id }));
      }
    }
  }, [initialData, products, warehouses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || !formData.warehouseId || formData.quantity === '') {
      setError('Please select product, warehouse, and provide quantity.');
      return;
    }

    if (Number(formData.quantity) < 0 || Number(formData.reservedQuantity) < 0 || Number(formData.reorderLevel) < 0) {
      setError('Quantities cannot be negative.');
      return;
    }

    const payload = {
      product: { id: parseInt(formData.productId, 10) },
      warehouse: { id: parseInt(formData.warehouseId, 10) },
      quantity: parseInt(formData.quantity, 10),
      reservedQuantity: parseInt(formData.reservedQuantity, 10),
      reorderLevel: parseInt(formData.reorderLevel, 10),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150 border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'Adjust Stock Allocation' : 'Add Inventory Stock'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Warehouse inventory count and thresholds</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <ErrorMessage message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                disabled={!!initialData}
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-60"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Warehouse Location <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                disabled={!!initialData}
                value={formData.warehouseId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-60"
              >
                <option value="">Select warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code} - {w.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Total Qty <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Reserved
                </label>
                <input
                  type="number"
                  min="0"
                  name="reservedQuantity"
                  value={formData.reservedQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Allocate Stock'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
