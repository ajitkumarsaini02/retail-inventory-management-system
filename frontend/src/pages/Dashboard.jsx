import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Warehouse,
  Boxes,
  ShoppingCart,
  Clock,
  Truck,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  DollarSign,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import warehouseService from '../services/warehouseService';
import inventoryService from '../services/inventoryService';
import orderService from '../services/orderService';
import supplierService from '../services/supplierService';
import purchaseOrderService from '../services/purchaseOrderService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Metrics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalInventory: 0,
    reservedInventory: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalSuppliers: 0,
    totalPurchaseOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState({});
  const [stockHealth, setStockHealth] = useState({ inStock: 0, lowStock: 0, outOfStock: 0 });

  const adminRole = isAdmin();

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError('');

      if (adminRole) {
        // ADMIN data fetching
        const [
          products,
          warehouses,
          inventoryList,
          orders,
          suppliers,
          purchaseOrders,
        ] = await Promise.all([
          productService.getAllProducts().catch(() => []),
          warehouseService.getAllWarehouses().catch(() => []),
          inventoryService.getAllInventory().catch(() => []),
          orderService.getAllOrders().catch(() => []),
          supplierService.getAllSuppliers().catch(() => []),
          purchaseOrderService.getAllPurchaseOrders().catch(() => []),
        ]);

        const pending = (orders || []).filter((o) => o.status === 'PENDING').length;
        const totalRev = (orders || []).reduce(
          (acc, curr) => acc + (Number(curr.totalAmount) || 0),
          0
        );

        // Low stock calculation
        let inStockCount = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        const lowStock = (inventoryList || []).filter((inv) => {
          const avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
          const reorder = inv.reorderLevel || 10;
          if (avail <= 0) {
            outOfStockCount++;
            return true;
          }
          if (avail <= reorder) {
            lowStockCount++;
            return true;
          }
          inStockCount++;
          return false;
        });

        const statusMap = {};
        (orders || []).forEach((o) => {
          const st = o.status || 'OTHER';
          statusMap[st] = (statusMap[st] || 0) + 1;
        });

        setStats({
          totalProducts: (products || []).length,
          totalWarehouses: (warehouses || []).length,
          totalInventory: (inventoryList || []).reduce(
            (acc, curr) => acc + (curr.quantity || 0),
            0
          ),
          reservedInventory: (inventoryList || []).reduce(
            (acc, curr) => acc + (curr.reservedQuantity || 0),
            0
          ),
          totalOrders: (orders || []).length,
          pendingOrders: pending,
          totalRevenue: totalRev,
          totalSuppliers: (suppliers || []).length,
          totalPurchaseOrders: (purchaseOrders || []).length,
        });

        setRecentOrders((orders || []).slice(-6).reverse());
        setLowStockItems(lowStock.slice(0, 5));
        setOrderStatusDistribution(statusMap);
        setStockHealth({
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        });
      } else {
        // USER data fetching
        const [products, warehouses, inventoryList, orders] = await Promise.all([
          productService.getAllProducts().catch(() => []),
          warehouseService.getAllWarehouses().catch(() => []),
          inventoryService.getAllInventory().catch(() => []),
          orderService.getAllOrders().catch(() => []),
        ]);

        const userOrders = (orders || []).filter(
          (o) => o.customer?.email === user?.email || o.customer?.id === user?.id
        );
        const finalOrders = userOrders.length > 0 ? userOrders : orders || [];
        const pending = finalOrders.filter((o) => o.status === 'PENDING').length;
        const totalRev = finalOrders.reduce(
          (acc, curr) => acc + (Number(curr.totalAmount) || 0),
          0
        );

        let inStockCount = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        const lowStock = (inventoryList || []).filter((inv) => {
          const avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
          const reorder = inv.reorderLevel || 10;
          if (avail <= 0) {
            outOfStockCount++;
            return true;
          }
          if (avail <= reorder) {
            lowStockCount++;
            return true;
          }
          inStockCount++;
          return false;
        });

        const statusMap = {};
        finalOrders.forEach((o) => {
          const st = o.status || 'OTHER';
          statusMap[st] = (statusMap[st] || 0) + 1;
        });

        setStats({
          totalProducts: (products || []).length,
          totalWarehouses: (warehouses || []).length,
          totalInventory: (inventoryList || []).reduce(
            (acc, curr) => acc + (curr.quantity || 0),
            0
          ),
          reservedInventory: (inventoryList || []).reduce(
            (acc, curr) => acc + (curr.reservedQuantity || 0),
            0
          ),
          totalOrders: finalOrders.length,
          pendingOrders: pending,
          totalRevenue: totalRev,
          totalSuppliers: 0,
          totalPurchaseOrders: 0,
        });

        setRecentOrders(finalOrders.slice(-6).reverse());
        setLowStockItems(lowStock.slice(0, 5));
        setOrderStatusDistribution(statusMap);
        setStockHealth({
          inStock: inStockCount,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        });
      }
    } catch (err) {
      setError('Failed to aggregate dashboard analytics: ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [adminRole, user?.email]);

  if (isLoading) {
    return <Loading message="Compiling enterprise executive metrics..." />;
  }

  // Stock health ratio
  const totalStockTracked =
    stockHealth.inStock + stockHealth.lowStock + stockHealth.outOfStock || 1;
  const inStockPct = Math.round((stockHealth.inStock / totalStockTracked) * 100);
  const lowStockPct = Math.round((stockHealth.lowStock / totalStockTracked) * 100);
  const outStockPct = 100 - inStockPct - lowStockPct;

  const fulfillmentRate = stats.totalOrders
    ? Math.round(
        (((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
      )
    : 100;

  return (
    <div className="space-y-6">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        {/* Glow ambient background effects */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {adminRole ? 'EXECUTIVE SUITE' : 'OPERATIONS PORTAL'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Core ERP • v2.4 Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()}, {user?.name || 'Authorized Operator'}
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
              Real-time telemetry on inventory availability, customer fulfillment pipelines, and supply chain logistics.
            </p>

            {/* Quick stats mini-strip inside hero */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-slate-400">Fulfillment Rate:</span>
                <span className="font-bold text-emerald-400">{fulfillmentRate}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-slate-400">Total Volume:</span>
                <span className="font-bold text-white font-mono">
                  {stats.totalInventory.toLocaleString()} Units
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-slate-400">Active Warehouses:</span>
                <span className="font-bold text-indigo-300">{stats.totalWarehouses} Hubs</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="p-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-xl backdrop-blur-xs border border-white/10 transition cursor-pointer"
              title="Refresh Analytics"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
              />
            </button>

            <button
              onClick={() => navigate('/orders/add')}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Create Order</span>
            </button>

            {adminRole && (
              <button
                onClick={() => navigate('/products/add')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/10 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add SKU</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorMessage message={error} retry={() => fetchDashboardData(false)} onDismiss={() => setError('')} />

      {/* Critical Stock Alert Banner (If items are out or low stock) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: {lowStockItems.length} inventory item{lowStockItems.length > 1 ? 's' : ''} below reorder threshold
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Supply risk detected. Review items and place purchase replenishment orders to prevent fulfillment delays.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/inventory')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Review Stock Alerts
            </button>
            {adminRole && (
              <button
                onClick={() => navigate('/purchase-orders/add')}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Create PO
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={() => navigate('/products')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Product Catalog
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.totalProducts}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              Active SKUs <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Standardized pricing</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% cataloged</span>
          </div>
        </div>

        {/* Total Warehouses */}
        <div
          onClick={() => navigate('/warehouses')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Warehouses
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.totalWarehouses}
            </span>
            <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
              Distribution Hubs <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Multi-facility mesh</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">Operational</span>
          </div>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {adminRole ? 'Total Sales Orders' : 'My Orders'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.totalOrders}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              Fulfillment <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Total Gross Value</span>
            <span className="text-slate-900 dark:text-white font-bold font-mono">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {stats.pendingOrders}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              Needs dispatch <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Fulfillment Status</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {stats.pendingOrders > 0 ? 'Action Queue' : 'Queue Clear'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Secondary Metrics Strip */}
      {adminRole && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/inventory')}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Units in Stock
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  {stats.totalInventory.toLocaleString()}
                </p>
                <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                  {stats.reservedInventory} units reserved for open orders
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition" />
          </div>

          <div
            onClick={() => navigate('/suppliers')}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Verified Suppliers
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  {stats.totalSuppliers}
                </p>
                <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                  Active supply vendor partners
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition" />
          </div>

          <div
            onClick={() => navigate('/purchase-orders')}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Procurement Orders
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  {stats.totalPurchaseOrders}
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  In-flight supplier PO receipts
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition" />
          </div>
        </div>
      )}

      {/* Middle Grid: Stock Health Meter & Order Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Funnel Pipeline (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Order Fulfillment Pipeline
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live distribution stages across customer orders
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Orders Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual stage cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-5">
              {[
                { status: 'PENDING', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/50' },
                { status: 'CONFIRMED', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/50' },
                { status: 'PROCESSING', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900/50' },
                { status: 'SHIPPED', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900/50' },
                { status: 'DELIVERED', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/50' },
                { status: 'CANCELLED', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/50' },
              ].map(({ status, bg, text, border }) => {
                const count = orderStatusDistribution[status] || 0;
                return (
                  <div
                    key={status}
                    className={`p-3 rounded-xl border ${border} ${bg} flex flex-col items-center justify-center text-center`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {status}
                    </span>
                    <span className={`text-lg font-extrabold font-mono mt-1 ${text}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stacked bar visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Fulfillment Progression</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  {stats.totalOrders} Total Orders Recorded
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                {[
                  { key: 'DELIVERED', color: 'bg-emerald-500' },
                  { key: 'SHIPPED', color: 'bg-purple-500' },
                  { key: 'PROCESSING', color: 'bg-indigo-500' },
                  { key: 'CONFIRMED', color: 'bg-blue-500' },
                  { key: 'PENDING', color: 'bg-amber-500' },
                  { key: 'CANCELLED', color: 'bg-rose-500' },
                ].map(({ key, color }) => {
                  const c = orderStatusDistribution[key] || 0;
                  const pct = stats.totalOrders ? (c / stats.totalOrders) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={key}
                      title={`${key}: ${c} (${Math.round(pct)}%)`}
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Fulfilled Orders: {orderStatusDistribution['DELIVERED'] || 0}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>In-Queue / Pending: {stats.pendingOrders}</span>
            </span>
          </div>
        </div>

        {/* Stock Health Radar Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Health</h3>
                  <p className="text-xs text-slate-400">Stock availability analysis</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 cursor-pointer"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-4">
              {/* In stock */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In Stock (Healthy)
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {stockHealth.inStock} SKUs
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${inStockPct}%` }}
                  />
                </div>
              </div>

              {/* Low stock */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Low Stock (Below Reorder)
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {stockHealth.lowStock} SKUs
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${lowStockPct}%` }}
                  />
                </div>
              </div>

              {/* Out of stock */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Out of Stock (Zero Available)
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {stockHealth.outOfStock} SKUs
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${outStockPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => navigate('/inventory')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <span>Full Stock Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders (2 cols) & Low Stock Table (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Customer Orders</h3>
                <p className="text-xs text-slate-400">Latest sales orders & fulfillment statuses</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 dark:text-slate-500">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => {
                    const statusColors = {
                      DELIVERED: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                      PENDING: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
                      CONFIRMED: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
                      PROCESSING: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
                      SHIPPED: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
                      CANCELLED: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
                    };
                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/orders/${ord.id}`)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {ord.customer?.name ? ord.customer.name.charAt(0) : 'C'}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {ord.customer?.name || 'Walk-in Customer'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                          ${Number(ord.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                              statusColors[ord.status] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-500'
                                  : ord.status === 'PENDING'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${ord.id}`);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock Alerts</h3>
                  <p className="text-xs text-slate-400">At or below reorder levels</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 cursor-pointer"
              >
                View
              </button>
            </div>

            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Healthy Stock Status</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    All SKUs are currently well above reorder limits.
                  </p>
                </div>
              ) : (
                lowStockItems.map((inv) => {
                  const avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
                  const isOut = avail <= 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {inv.product?.name || `Product #${inv.productId}`}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                          SKU: {inv.product?.sku || 'N/A'} • {inv.warehouse?.name || 'Warehouse'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono ${
                            isOut
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                          }`}
                        >
                          {avail} left (min: {inv.reorderLevel || 10})
                        </span>
                        {adminRole && (
                          <button
                            onClick={() => navigate('/purchase-orders/add')}
                            className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-1 cursor-pointer"
                          >
                            + Reorder PO
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <button
              onClick={() => navigate('/inventory')}
              className="w-full py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage all warehouse inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
