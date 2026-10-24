import React from 'react';
import { ShoppingCart, Calendar, User, MapPin, DollarSign, Package, Printer } from 'lucide-react';

const OrderDetails = ({ order }) => {
  if (!order) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors print-area">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              {order.orderNumber}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tax Invoice & Dispatch Slip</h2>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Print Invoice</span>
          </button>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50"
          >
            Status: {order.status}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer & Shipping information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Customer Information</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{order.customer?.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{order.customer?.email}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{order.customer?.phone}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Shipping Address</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Placed on: {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Items in this order
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {!order.orderItems || order.orderItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400 dark:text-slate-500">
                      No order items found.
                    </td>
                  </tr>
                ) : (
                  order.orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.product?.name || `Product #${item.product?.id}`}
                        </div>
                        <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
                          {item.product?.sku}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 font-mono">
                        ${Number(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        ${Number(item.subtotal || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">${Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Shipping & Handling:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
              <span>Total Paid:</span>
              <span className="text-indigo-600 dark:text-indigo-400">${Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
