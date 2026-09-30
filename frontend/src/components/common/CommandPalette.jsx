import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Users,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  PlusCircle,
  ArrowRight,
  X,
  Terminal,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const baseCommands = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Executive analytics, metrics & charts',
      icon: LayoutDashboard,
      path: '/dashboard',
      category: 'Navigation',
    },
    {
      id: 'products',
      title: 'Product Catalog',
      subtitle: 'Manage items, SKUs, pricing & brands',
      icon: Package,
      path: '/products',
      category: 'Inventory & Catalog',
    },
    {
      id: 'inventory',
      title: 'Stock Levels & Reorder',
      subtitle: 'Monitor stock availability across warehouses',
      icon: Boxes,
      path: '/inventory',
      category: 'Inventory & Catalog',
    },
    {
      id: 'warehouses',
      title: 'Warehouse Locations',
      subtitle: 'Distribution centers and storage capacities',
      icon: Warehouse,
      path: '/warehouses',
      category: 'Logistics',
    },
    {
      id: 'orders',
      title: 'Customer Orders',
      subtitle: 'View and track all client sales orders',
      icon: ShoppingCart,
      path: '/orders',
      category: 'Orders',
    },
    {
      id: 'create-order',
      title: 'Create New Order',
      subtitle: 'Draft sales order with item lines',
      icon: PlusCircle,
      path: '/orders/add',
      category: 'Quick Actions',
    },
    {
      id: 'customers',
      title: 'Customer Directory',
      subtitle: 'View customer accounts and contact info',
      icon: Users,
      path: '/customers',
      category: 'CRM',
    },
    {
      id: 'toggle-theme',
      title: isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: `Currently active: ${isDark ? 'Dark Mode' : 'Light Mode'}`,
      icon: isDark ? Sun : Moon,
      action: () => toggleTheme(),
      category: 'Preferences',
    },
  ];

  if (isAdmin()) {
    baseCommands.push(
      {
        id: 'add-product',
        title: 'Add New Product',
        subtitle: 'Add a new SKU to inventory catalog',
        icon: PlusCircle,
        path: '/products/add',
        category: 'Quick Actions',
      },
      {
        id: 'suppliers',
        title: 'Suppliers Management',
        subtitle: 'Vendor contact information and status',
        icon: Truck,
        path: '/suppliers',
        category: 'Supply Chain',
      },
      {
        id: 'purchase-orders',
        title: 'Purchase Orders',
        subtitle: 'Procurement orders for suppliers',
        icon: FileSpreadsheet,
        path: '/purchase-orders',
        category: 'Supply Chain',
      },
      {
        id: 'create-po',
        title: 'Create Purchase Order',
        subtitle: 'Initiate stock procurement request',
        icon: PlusCircle,
        path: '/purchase-orders/add',
        category: 'Quick Actions',
      }
    );
  }

  const filteredCommands = baseCommands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (command) => {
    if (!command) return;
    onClose();
    if (command.action) {
      command.action();
    } else if (command.path) {
      navigate(command.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3.5 bg-slate-50/50 dark:bg-slate-800/40">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (e.g. Products, Orders)"
            className="w-full text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No matching destinations found for "{query}".
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const Icon = command.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={command.id}
                  onClick={() => handleSelect(command)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {command.title}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {command.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {command.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">
                ↵
              </kbd>{' '}
              to select
            </span>
          </div>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
            <Terminal className="w-3 h-3" /> Quick Navigation
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
