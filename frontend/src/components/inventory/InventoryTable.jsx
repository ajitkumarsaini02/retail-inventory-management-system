import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Download,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TablePagination from '../common/TablePagination';

const InventoryTable = ({
  inventory = [],
  products = [],
  warehouses = [],
  onEdit,
  onDelete,
  isLoading,
}) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('product');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getStockStatus = (item) => {
    const qty = Number(item.quantity || 0);
    const reserved = Number(item.reservedQuantity || 0);
    const available = qty - reserved;
    const reorder = Number(item.reorderLevel || 0);

    if (available <= 0) {
      return {
        label: 'OUT OF STOCK',
        color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
      };
    }
    if (available <= reorder) {
      return {
        label: 'LOW STOCK',
        color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'IN STOCK',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered and sorted inventory
  const processedInventory = useMemo(() => {
    let result = inventory.filter((item) => {
      const q = searchTerm.toLowerCase();
      const productName = item.product?.name || '';
      const sku = item.product?.sku || '';
      const warehouseName = item.warehouse?.name || '';
      const warehouseCode = item.warehouse?.code || '';

      const matchesSearch =
        productName.toLowerCase().includes(q) ||
        sku.toLowerCase().includes(q) ||
        warehouseName.toLowerCase().includes(q) ||
        warehouseCode.toLowerCase().includes(q);

      const matchesProduct =
        productFilter === 'ALL' || String(item.product?.id) === String(productFilter);

      const matchesWarehouse =
        warehouseFilter === 'ALL' || String(item.warehouse?.id) === String(warehouseFilter);

      const statusObj = getStockStatus(item);
      const matchesStatus =
        statusFilter === 'ALL' || statusObj.label === statusFilter;

      return matchesSearch && matchesProduct && matchesWarehouse && matchesStatus;
    });

    result.sort((a, b) => {
      let valA, valB;

      if (sortField === 'product') {
        valA = (a.product?.name || '').toLowerCase();
        valB = (b.product?.name || '').toLowerCase();
      } else if (sortField === 'warehouse') {
        valA = (a.warehouse?.name || '').toLowerCase();
        valB = (b.warehouse?.name || '').toLowerCase();
      } else if (sortField === 'quantity') {
        valA = Number(a.quantity || 0);
        valB = Number(b.quantity || 0);
      } else if (sortField === 'available') {
        valA = Number(a.quantity || 0) - Number(a.reservedQuantity || 0);
        valB = Number(b.quantity || 0) - Number(b.reservedQuantity || 0);
      } else if (sortField === 'reorderLevel') {
        valA = Number(a.reorderLevel || 0);
        valB = Number(b.reorderLevel || 0);
      } else {
        valA = (a[sortField] || '').toString();
        valB = (b[sortField] || '').toString();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [inventory, searchTerm, productFilter, warehouseFilter, statusFilter, sortField, sortAsc]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(processedInventory.length / pageSize));
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedInventory.slice(start, start + pageSize);
  }, [processedInventory, currentPage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    if (processedInventory.length === 0) return;
    const headers = ['Product', 'SKU', 'Warehouse', 'Code', 'Total Qty', 'Reserved', 'Available', 'Reorder Level', 'Stock Status'];
    const rows = processedInventory.map((item) => {
      const avail = Number(item.quantity || 0) - Number(item.reservedQuantity || 0);
      const st = getStockStatus(item).label;
      return [
        `"${(item.product?.name || '').replace(/"/g, '""')}"`,
        `"${item.product?.sku || ''}"`,
        `"${(item.warehouse?.name || '').replace(/"/g, '""')}"`,
        `"${item.warehouse?.code || ''}"`,
        item.quantity || 0,
        item.reservedQuantity || 0,
        avail,
        item.reorderLevel || 0,
        `"${st}"`,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/40">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, SKU, warehouse..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Hubs</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs col-span-2 sm:col-span-1 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN STOCK">IN STOCK</option>
              <option value="LOW STOCK">LOW STOCK</option>
              <option value="OUT OF STOCK">OUT OF STOCK</option>
            </select>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="font-bold text-slate-700 dark:text-slate-300">{processedInventory.length}</span> records
          </span>

          <button
            onClick={handleExportCSV}
            disabled={processedInventory.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs disabled:opacity-40 cursor-pointer"
            title="Export inventory records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <th
                onClick={() => handleSort('product')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Product / SKU</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('warehouse')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Warehouse Hub</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Qty</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Reserved</th>
              <th
                onClick={() => handleSort('available')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Available</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('reorderLevel')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Reorder Level</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Status</th>
              {isAdmin() && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={isAdmin() ? 8 : 7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Auditing inventory records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedInventory.length === 0 ? (
              <tr>
                <td colSpan={isAdmin() ? 8 : 7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Boxes className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No inventory entries found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Adjust your filters or add initial stock levels.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInventory.map((item) => {
                const qty = Number(item.quantity || 0);
                const reserved = Number(item.reservedQuantity || 0);
                const available = qty - reserved;
                const status = getStockStatus(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.product?.name || `Product #${item.productId}`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {item.product?.sku || 'SKU N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.warehouse?.name || `Warehouse #${item.warehouseId}`}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        {item.warehouse?.code} • {item.warehouse?.city || 'Location'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                      {qty.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
                      {reserved > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">{reserved}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold font-mono">
                      <span
                        className={
                          available <= 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : available <= (item.reorderLevel || 10)
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {available.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 dark:text-slate-500 font-mono text-xs">
                      {item.reorderLevel || 10}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${status.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            title="Adjust Stock"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item)}
                            title="Delete Stock Entry"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={processedInventory.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default InventoryTable;
