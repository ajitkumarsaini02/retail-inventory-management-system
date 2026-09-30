import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const OrderItemForm = ({ products = [], items, onAddItem, onRemoveItem }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    const prod = products.find((p) => String(p.id) === String(pId));
    if (prod) {
      setUnitPrice(prod.price || 0);
    } else {
      setUnitPrice('');
    }
  };

  const handleAdd = () => {
    if (!selectedProductId || quantity <= 0) return;
    const prod = products.find((p) => String(p.id) === String(selectedProductId));
    if (!prod) return;

    const subtotal = Number(unitPrice) * Number(quantity);

    onAddItem({
      product: { id: prod.id, name: prod.name, sku: prod.sku },
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      subtotal: Number(subtotal.toFixed(2)),
    });

    // Reset fields
    setSelectedProductId('');
    setQuantity(1);
    setUnitPrice('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-slate-50 dark:bg-slate-850/60 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Select Product
          </label>
          <select
            value={selectedProductId}
            onChange={handleProductSelect}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-850 dark:text-slate-100"
          >
            <option value="">Choose item to add...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) - ${Number(p.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Qty
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-850 dark:text-slate-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
            Unit Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-850 dark:text-slate-100"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedProductId}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400 dark:text-slate-500">
                    No items added yet. Select a product above to add to this order.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono">{item.product.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderItemForm;
