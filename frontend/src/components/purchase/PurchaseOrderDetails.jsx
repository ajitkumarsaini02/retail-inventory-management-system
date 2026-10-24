import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowLeft,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Package,
  Printer,
} from 'lucide-react';
import { PURCHASE_ORDER_STATUSES } from '../../utils/constants';

const statusBadge = (status) => {
  switch (status) {
    case 'RECEIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          RECEIVED
        </span>
      );
    case 'ORDERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
          <Clock className="w-3.5 h-3.5" />
          ORDERED
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          APPROVED
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="w-3.5 h-3.5" />
          PENDING
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          <XCircle className="w-3.5 h-3.5" />
          CANCELLED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {status}
        </span>
      );
  }
};

const PurchaseOrderDetails = ({ purchaseOrder, onStatusUpdate, isUpdatingStatus }) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState(purchaseOrder?.status || 'PENDING');

  if (!purchaseOrder) return null;

  const items = purchaseOrder.purchaseOrderItems || [];

  return (
    <div className="space-y-6 print-area">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="no-print p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Back to Purchase Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {purchaseOrder.purchaseOrderNumber}
              </h2>
              {statusBadge(purchaseOrder.status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consignment PO • Ordered on {purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions & Status updater for Admin */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition cursor-pointer"
            title="Print Purchase Consignment Note"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Print PO Slip</span>
          </button>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="no-print px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {PURCHASE_ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <button
            onClick={() => onStatusUpdate && onStatusUpdate(selectedStatus)}
            disabled={isUpdatingStatus || selectedStatus === purchaseOrder.status}
            className="no-print px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition shadow-xs cursor-pointer"
          >
            {isUpdatingStatus ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Grid: Supplier Details & Delivery Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Supplier / Vendor Information</span>
          </div>
          {purchaseOrder.supplier ? (
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{purchaseOrder.supplier.name}</p>
              <p>Contact Person: {purchaseOrder.supplier.contactPerson || 'N/A'}</p>
              <p>Email: {purchaseOrder.supplier.email}</p>
              <p>Phone: {purchaseOrder.supplier.phone}</p>
              <p>
                Address: {purchaseOrder.supplier.address}, {purchaseOrder.supplier.city},{' '}
                {purchaseOrder.supplier.state} - {purchaseOrder.supplier.pincode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">No supplier details linked</p>
          )}
        </div>

        {/* Delivery & Schedule Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Delivery & Schedule</span>
          </div>
          <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Expected Delivery:</span>
              <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                {purchaseOrder.expectedDeliveryDate
                  ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Created At:</span>
              <p>{purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Last Updated:</span>
              <p>{purchaseOrder.updatedAt ? new Date(purchaseOrder.updatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Ordered Items</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{items.length} product(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4 text-right">Unit Cost</th>
                <th className="py-2.5 px-4 text-right">Ordered Qty</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No items in this purchase order.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.product ? item.product.name : `Product #${item.productId || 'N/A'}`}
                      </span>
                      {item.product?.sku && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono">
                          {item.product.sku}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      ${Number(item.unitCost || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      ${Number(item.subtotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700">
                <td colSpan="3" className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                  Total Order Amount:
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                  ${Number(purchaseOrder.totalAmount || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;
