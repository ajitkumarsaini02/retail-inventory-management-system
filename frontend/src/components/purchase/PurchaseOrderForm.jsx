import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, CheckCircle } from 'lucide-react';
import PurchaseOrderItemForm from './PurchaseOrderItemForm';
import ErrorMessage from '../common/ErrorMessage';
import { PURCHASE_ORDER_STATUSES } from '../../utils/constants';

const PurchaseOrderForm = ({
  suppliers = [],
  products = [],
  initialData = null,
  onSubmit,
  isSubmitting,
}) => {
  const navigate = useNavigate();
  const [poNumber, setPoNumber] = useState(`PO-${Date.now()}`);
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setPoNumber(initialData.purchaseOrderNumber || `PO-${Date.now()}`);
      setSupplierId(initialData.supplier?.id ? String(initialData.supplier.id) : '');
      setStatus(initialData.status || 'PENDING');
      if (initialData.expectedDeliveryDate) {
        // Format to YYYY-MM-DD
        const dateStr = initialData.expectedDeliveryDate.substring(0, 10);
        setExpectedDeliveryDate(dateStr);
      }
      if (initialData.purchaseOrderItems) {
        setItems(
          initialData.purchaseOrderItems.map((item) => ({
            product: item.product || { id: item.productId, name: 'Product', sku: '' },
            quantity: item.quantity,
            unitCost: item.unitCost,
            subtotal: item.subtotal,
          }))
        );
      }
    }
  }, [initialData]);

  const handleAddItem = (item) => {
    setItems((prev) => [...prev, item]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier for this purchase order.');
      return;
    }

    if (!initialData && items.length === 0) {
      setError('Please add at least one line item to the purchase order.');
      return;
    }

    if (!expectedDeliveryDate) {
      setError('Please provide an expected delivery date.');
      return;
    }

    const payload = {
      purchaseOrderNumber: poNumber,
      supplier: { id: parseInt(supplierId, 10) },
      totalAmount: Number(totalAmount.toFixed(2)),
      status,
      // LocalDateTime string ISO: YYYY-MM-DDTHH:mm:ss
      expectedDeliveryDate: `${expectedDeliveryDate}T18:00:00`,
      purchaseOrderItems: items.map((item) => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.subtotal,
      })),
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Update Purchase Order' : 'Create Procurement Purchase Order'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Procure stock from authorized suppliers and restock inventory
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 font-mono border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Supplier / Vendor <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
              >
                {PURCHASE_ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Expected Delivery <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Procurement Items
            </h4>
            <PurchaseOrderItemForm
              products={products}
              items={items}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Total Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Items Count: {items.length}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Supplier ID: {supplierId || 'Not selected'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total PO Cost</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/purchase-orders')}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (items.length === 0 && !initialData)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving PO...' : initialData ? 'Update Order' : 'Create Purchase Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
