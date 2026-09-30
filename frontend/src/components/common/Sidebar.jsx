import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  Users,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  X,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
    }`;

  const navIconClass = (isActive) =>
    `w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
      isActive
        ? 'text-white'
        : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  Retail Inventory ERP
                </h1>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Enterprise Edition
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Order shortcut button */}
        <div className="p-3.5 pb-0">
          <button
            onClick={() => {
              onClose();
              navigate('/orders/add');
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-98 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {/* Main Logistical Operations */}
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Logistics & Catalog
            </p>
            <nav className="space-y-1">
              <NavLink to="/dashboard" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className={navIconClass(isActive)} />
                    <span>Executive Dashboard</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/products" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Package className={navIconClass(isActive)} />
                    <span>Product Catalog</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/inventory" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Boxes className={navIconClass(isActive)} />
                    <span>Inventory Levels</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/warehouses" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Warehouse className={navIconClass(isActive)} />
                    <span>Warehouses</span>
                  </div>
                )}
              </NavLink>
            </nav>
          </div>

          {/* Sales & Fulfilment */}
          <div>
            <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Sales & CRM
            </p>
            <nav className="space-y-1">
              <NavLink to="/orders" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <ShoppingCart className={navIconClass(isActive)} />
                    <span>Customer Orders</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/customers" onClick={onClose} className={navItemClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Users className={navIconClass(isActive)} />
                    <span>Customers</span>
                  </div>
                )}
              </NavLink>
            </nav>
          </div>

          {/* Admin Operations */}
          {isAdmin() && (
            <div>
              <div className="px-3 flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Supply Chain (Admin)
                </p>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <nav className="space-y-1">
                <NavLink to="/suppliers" onClick={onClose} className={navItemClass}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-3">
                      <Truck className={navIconClass(isActive)} />
                      <span>Suppliers Directory</span>
                    </div>
                  )}
                </NavLink>

                <NavLink to="/purchase-orders" onClick={onClose} className={navItemClass}>
                  {({ isActive }) => (
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className={navIconClass(isActive)} />
                      <span>Purchase Orders</span>
                    </div>
                  )}
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Profile and Sign out card */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 mb-3 p-2 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Operator'}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                    user?.role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {user?.role || 'USER'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">• Online</span>
              </div>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className="w-8 h-4 bg-slate-200 dark:bg-indigo-600 rounded-full relative transition-colors">
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                  isDark ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/60 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
