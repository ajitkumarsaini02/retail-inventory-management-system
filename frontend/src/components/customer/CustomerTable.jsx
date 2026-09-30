import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, Users, Mail, Phone, ArrowUpDown, Download, X, MapPin, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TablePagination from '../common/TablePagination';

const CustomerTable = ({ customers = [], onView, onEdit, onDelete, isLoading }) => {
  const navigate = useNavigate();
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

  const processedCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase();
      let valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, searchTerm, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(processedCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCustomers.slice(start, start + pageSize);
  }, [processedCustomers, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (processedCustomers.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'City', 'State', 'Pincode'];
    const rows = processedCustomers.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.city || ''}"`,
      `"${c.state || ''}"`,
      `"${c.pincode || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_directory_${new Date().toISOString().slice(0, 10)}.csv`);
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
            placeholder="Search customer name, email, phone, city..."
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
            <span className="font-bold text-slate-700 dark:text-slate-300">{processedCustomers.length}</span> clients
          </span>
          <button
            onClick={handleExportCSV}
            disabled={processedCustomers.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Customer Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Contact Channels</th>
              <th
                onClick={() => handleSort('city')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none"
              >
                <div className="flex items-center gap-1">
                  <span>City / Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">State & Pincode</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading customer accounts...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No customer profiles found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Add customer profiles to start ordering and shipping goods.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onView(cust)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cust.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{cust.email || '—'}</span>
                    </div>
                    {cust.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{cust.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span>{cust.city || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cust.state || '—'}</span>
                    {cust.pincode && (
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-xs ml-1.5">({cust.pincode})</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/orders/add?customerId=${cust.id}`)}
                        title="Create Order for this Customer"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onView(cust)}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(cust.id)}
                        title="Edit Customer"
                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isAdmin() && (
                        <button
                          onClick={() => onDelete(cust)}
                          title="Delete Customer"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        totalItems={processedCustomers.length}
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

export default CustomerTable;
