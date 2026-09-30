import React, { useState, useMemo } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Warehouse as WarehouseIcon,
  ArrowUpDown,
  Download,
  X,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TablePagination from '../common/TablePagination';

const WarehouseTable = ({ warehouses = [], onView, onEdit, onDelete, isLoading }) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const processedWarehouses = useMemo(() => {
    let result = warehouses.filter((w) => {
      const q = searchTerm.toLowerCase();
      return (
        w.name?.toLowerCase().includes(q) ||
        w.code?.toLowerCase().includes(q) ||
        w.city?.toLowerCase().includes(q) ||
        w.state?.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'capacity') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [warehouses, searchTerm, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(processedWarehouses.length / pageSize));
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedWarehouses.slice(start, start + pageSize);
  }, [processedWarehouses, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (processedWarehouses.length === 0) return;
    const headers = ['Code', 'Name', 'City', 'State', 'Capacity', 'Status'];
    const rows = processedWarehouses.map((w) => [
      `"${w.code || ''}"`,
      `"${(w.name || '').replace(/"/g, '""')}"`,
      `"${w.city || ''}"`,
      `"${w.state || ''}"`,
      w.capacity || 0,
      `"${w.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `warehouses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xs border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, name, city, state..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs transition"
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="font-bold text-slate-700 dark:text-slate-300">{processedWarehouses.length}</span> facilities
          </span>
          <button
            onClick={handleExportCSV}
            disabled={processedWarehouses.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Hub Code</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Warehouse Facility</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('city')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Location</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('capacity')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Capacity Units</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading warehouse networks...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedWarehouses.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <WarehouseIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No warehouses registered</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Register distribution facilities to allocate product inventory.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedWarehouses.map((wh) => (
                <tr
                  key={wh.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onView(wh)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {wh.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {wh.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{wh.city}</span>
                      {wh.state && <span className="text-slate-400 dark:text-slate-500">, {wh.state}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                    {wh.capacity ? Number(wh.capacity).toLocaleString() : 'Unlimited'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
                        wh.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          wh.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {wh.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(wh)}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin() && (
                        <>
                          <button
                            onClick={() => onEdit(wh.id)}
                            title="Edit Warehouse"
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(wh)}
                            title="Delete Warehouse"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={processedWarehouses.length}
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

export default WarehouseTable;
