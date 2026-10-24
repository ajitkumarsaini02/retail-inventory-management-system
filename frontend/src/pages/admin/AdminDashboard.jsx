import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import warehouseService from '../../services/warehouseService';
import inventoryService from '../../services/inventoryService';
import orderService from '../../services/orderService';
import supplierService from '../../services/supplierService';
import purchaseOrderService from '../../services/purchaseOrderService';
import userService from '../../services/userService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDashboard = ({ onSwitchToUserView }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('ALL'); // 'ALL', '30D', '7D', 'TODAY'
  const [poFilter, setPoFilter] = useState('ALL');
  const [updatingPoId, setUpdatingPoId] = useState(null);

  // Raw data from APIs
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userStats, setUserStats] = useState({ totalUsers: 0, adminCount: 0, operatorCount: 0 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchAdminData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError('');

      const [
        prodsRes,
        whsRes,
        invRes,
        ordRes,
        suppRes,
        poRes,
        usersRes,
        statsRes,
      ] = await Promise.all([
        productService.getAllProducts().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        inventoryService.getAllInventory().catch(() => []),
        orderService.getAllOrders().catch(() => []),
        supplierService.getAllSuppliers().catch(() => []),
        purchaseOrderService.getAllPurchaseOrders().catch(() => []),
        userService.getAllUsers().catch(() => []),
        userService.getUserStats().catch(() => ({ totalUsers: 0, adminCount: 0, operatorCount: 0 })),
      ]);

      setProducts(prodsRes || []);
      setWarehouses(whsRes || []);
      setInventoryList(invRes || []);
      setOrders(ordRes || []);
      setSuppliers(suppRes || []);
      setPurchaseOrders(poRes || []);
      setUsersList(usersRes || []);
      setUserStats(statsRes || { totalUsers: 0, adminCount: 0, operatorCount: 0 });
    } catch (err) {
      setError('Failed to aggregate executive analytics: ' + (err.message || 'Error occurred'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Filtered orders by timeframe
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (timeRange === 'ALL') return orders;

    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.orderDate || o.createdAt);
      if (isNaN(orderDate.getTime())) return true;
      const diffMs = now - orderDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeRange === 'TODAY') return diffDays <= 1;
      if (timeRange === '7D') return diffDays <= 7;
      if (timeRange === '30D') return diffDays <= 30;
      return true;
    });
  }, [orders, timeRange]);

  // Executive KPI Calculations
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  }, [filteredOrders]);

  const averageOrderValue = useMemo(() => {
    return filteredOrders.length ? totalRevenue / filteredOrders.length : 0;
  }, [filteredOrders, totalRevenue]);

  const totalStockUnits = useMemo(() => {
    return inventoryList.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  }, [inventoryList]);

  const reservedStockUnits = useMemo(() => {
    return inventoryList.reduce((acc, curr) => acc + (Number(curr.reservedQuantity) || 0), 0);
  }, [inventoryList]);

  const availableStockUnits = Math.max(0, totalStockUnits - reservedStockUnits);

  // Asset Valuation (sum of product price * quantity on hand)
  const totalInventoryAssetValue = useMemo(() => {
    const productPriceMap = new Map();
    products.forEach((p) => {
      productPriceMap.set(p.id, Number(p.price) || 0);
    });

    return inventoryList.reduce((sum, inv) => {
      const unitPrice =
        inv.product?.price !== undefined
          ? Number(inv.product.price)
          : productPriceMap.get(inv.productId) || 0;
      return sum + unitPrice * (Number(inv.quantity) || 0);
    }, 0);
  }, [inventoryList, products]);

  // Low stock and out-of-stock items
  const { lowStockItems, stockHealth } = useMemo(() => {
    let inStock = 0;
    let low = 0;
    let out = 0;
    const items = [];

    inventoryList.forEach((inv) => {
      const avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
      const reorder = inv.reorderLevel || 10;

      if (avail <= 0) {
        out++;
        items.push({ ...inv, isOut: true });
      } else if (avail <= reorder) {
        low++;
        items.push({ ...inv, isOut: false });
      } else {
        inStock++;
      }
    });

    return {
      lowStockItems: items,
      stockHealth: { inStock, lowStock: low, outOfStock: out },
    };
  }, [inventoryList]);

  // Order status distribution
  const orderStatusDistribution = useMemo(() => {
    const map = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    filteredOrders.forEach((o) => {
      const st = o.status || 'PENDING';
      map[st] = (map[st] || 0) + 1;
    });
    return map;
  }, [filteredOrders]);

  // PO status distribution
  const poStatusDistribution = useMemo(() => {
    const map = {
      PENDING: 0,
      APPROVED: 0,
      ORDERED: 0,
      RECEIVED: 0,
      CANCELLED: 0,
    };
    purchaseOrders.forEach((po) => {
      const st = po.status || 'PENDING';
      map[st] = (map[st] || 0) + 1;
    });
    return map;
  }, [purchaseOrders]);

  const filteredPurchaseOrders = useMemo(() => {
    if (poFilter === 'ALL') return purchaseOrders;
    return purchaseOrders.filter((po) => po.status === poFilter);
  }, [purchaseOrders, poFilter]);

  // Warehouse breakdown
  const warehouseBreakdown = useMemo(() => {
    const map = new Map();
    warehouses.forEach((w) => {
      map.set(w.id, {
        ...w,
        itemCount: 0,
        totalQuantity: 0,
        reservedQuantity: 0,
      });
    });

    inventoryList.forEach((inv) => {
      const wid = inv.warehouse?.id || inv.warehouseId;
      if (wid && map.has(wid)) {
        const item = map.get(wid);
        item.itemCount += 1;
        item.totalQuantity += Number(inv.quantity) || 0;
        item.reservedQuantity += Number(inv.reservedQuantity) || 0;
      }
    });

    return Array.from(map.values());
  }, [warehouses, inventoryList]);

  // Handle PO status update directly from dashboard
  const handleQuickPoStatusChange = async (po, newStatus) => {
    try {
      setUpdatingPoId(po.id);
      await purchaseOrderService.updatePurchaseOrder(po.id, {
        ...po,
        status: newStatus,
      });
      // Refresh silently
      await fetchAdminData(true);
    } catch (err) {
      alert('Failed to update PO status: ' + (err.message || 'Error'));
    } finally {
      setUpdatingPoId(null);
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      await fetchAdminData(true);
    } catch (err) {
      alert('Failed to toggle user status: ' + (err.message || 'Error'));
    }
  };

  if (isLoading) {
    return <Loading message="Compiling executive administrative telemetry..." />;
  }

  const fulfillmentRate = filteredOrders.length
    ? Math.round(
        (((filteredOrders.length - (orderStatusDistribution['PENDING'] || 0)) /
          filteredOrders.length) *
          100)
      )
    : 100;

  return (
    <div className="space-y-6" id="admin-dashboard-root">
      {/* Executive Command Banner matching Aurora Blue / Royal Indigo palette */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111827] p-6 sm:p-8 text-[#0f172a] dark:text-white shadow-sm border border-[#e2e8f0] dark:border-[#1e293b] transition-colors">
        {/* Ambient Subtle Wave/Glow matching mockup */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-indigo-100/50 via-purple-50/30 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent pointer-events-none rounded-r-3xl" />
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-50 dark:bg-indigo-950/60 text-[#6366f1] dark:text-[#a855f7] border border-indigo-200 dark:border-indigo-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6366f1] dark:text-[#a855f7]" />
                Executive Admin Console
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-teal-950/50 text-[#059669] dark:text-[#22d3ee] border border-emerald-200 dark:border-teal-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Multi-Hub Telemetry
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a] dark:text-white">
              {getGreeting()}, {user?.name || 'Administrator'}
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] text-sm mt-1.5 leading-relaxed">
              Complete oversight of supply chain procurement, warehouse capacity distribution, gross revenue, and operator access controls.
            </p>

            {/* Quick Metrics Bar inside Hero */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Total Asset Value:</span>
                <span className="font-bold text-[#10b981] font-mono">
                  ${totalInventoryAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Fulfillment Rate:</span>
                <span className="font-bold text-[#06b6d4] dark:text-[#22d3ee]">{fulfillmentRate}%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Open POs:</span>
                <span className="font-bold text-[#f59e0b]">
                  {purchaseOrders.filter((po) => po.status !== 'RECEIVED' && po.status !== 'CANCELLED').length} In Flight
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* View As Operator Toggle */}
            <button
              onClick={onSwitchToUserView || (() => navigate('/dashboard/user'))}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs transition flex items-center gap-2 cursor-pointer"
              title="Preview Operator / Store Associate Workspace"
              id="admin-switch-to-user-btn"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Operator View</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchAdminData(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-200 rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs transition cursor-pointer"
              title="Refresh Analytics"
              id="admin-refresh-btn"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#6366f1] dark:text-[#a855f7]' : ''}`}
              />
            </button>

            {/* Issue PO (Accent Amber #F59E0B) */}
            <button
              onClick={() => navigate('/purchase-orders/add')}
              className="px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              id="admin-create-po-btn"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Issue PO</span>
            </button>

            {/* Add SKU (Primary Button #6366F1 / #7C3AED) */}
            <button
              onClick={() => navigate('/products/add')}
              className="px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/25 dark:shadow-purple-900/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
              id="admin-add-product-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add SKU</span>
            </button>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} retry={() => fetchAdminData(false)} onDismiss={() => setError('')} />

      {/* Critical Stock Shortage Alert (Actionable for Procurement) */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  Critical Inventory Replenishment Alert: {lowStockItems.length} SKUs require procurement
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  {stockHealth.outOfStock} Out of Stock
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-1">
                Fulfillment risks identified across active warehouses. Immediately issue supplier purchase orders to replenish threshold stock.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/inventory')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer text-center"
            >
              Audit Inventory
            </button>
            <button
              onClick={() => navigate('/purchase-orders/add')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft PO</span>
            </button>
          </div>
        </div>
      )}

      {/* Time Range Filter & Section Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Enterprise Overview</h2>
          <span className="text-xs text-slate-400">({filteredOrders.length} orders analyzed)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#1e293b] p-1 rounded-xl border border-slate-200 dark:border-[#334155] self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'All Time' },
            { id: '30D', label: 'Last 30 Days' },
            { id: '7D', label: 'Last 7 Days' },
            { id: 'TODAY', label: 'Today' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                timeRange === t.id
                  ? 'bg-[#6366f1] dark:bg-[#7c3aed] text-white shadow-xs'
                  : 'text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Gross Sales Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#10b981] dark:text-[#34d399] flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#10b981] dark:text-[#34d399] font-semibold flex items-center gap-1">
              Sales <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Avg Order Value:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              ${averageOrderValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Inventory Asset Valuation */}
        <div
          onClick={() => navigate('/inventory')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Inventory Asset Valuation
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8b5cf6] dark:text-[#a855f7] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              ${totalInventoryAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#8b5cf6] dark:text-[#a855f7] font-semibold flex items-center gap-1">
              Asset Value <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Units on hand:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {totalStockUnits.toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Warehouses & Network */}
        <div
          onClick={() => navigate('/warehouses')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Distribution Hubs
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#06b6d4] dark:text-[#22d3ee] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              {warehouses.length} Hubs
            </span>
            <span className="text-xs text-[#06b6d4] dark:text-[#22d3ee] font-semibold flex items-center gap-1">
              Operational <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Reserved Volume:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {reservedStockUnits} reserved
            </span>
          </div>
        </div>

        {/* Suppliers & Procurement */}
        <div
          onClick={() => navigate('/purchase-orders')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Procurement & Vendors
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#f59e0b] dark:text-[#f59e0b] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {purchaseOrders.length} POs
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              {suppliers.length} Vendors <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Pending Delivery:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {poStatusDistribution['ORDERED'] + poStatusDistribution['PENDING'] + poStatusDistribution['APPROVED']} active
            </span>
          </div>
        </div>
      </div>

      {/* Supply Chain & Purchase Orders Lifecycle Funnel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Supply Chain & Purchase Order Lifecycle
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  Admin Exclusive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Track procurement stages from initial request to warehouse receiving
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/suppliers')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Vendors</span>
            </button>
            <button
              onClick={() => navigate('/purchase-orders/add')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New PO</span>
            </button>
          </div>
        </div>

        {/* PO Stage Cards Filter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-5">
          {[
            { status: 'ALL', label: 'All Orders', count: purchaseOrders.length, color: 'text-slate-800 dark:text-white', border: 'border-slate-200 dark:border-slate-700' },
            { status: 'PENDING', label: 'Pending Approval', count: poStatusDistribution['PENDING'], color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/60' },
            { status: 'APPROVED', label: 'Approved', count: poStatusDistribution['APPROVED'], color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/60' },
            { status: 'ORDERED', label: 'In Transit', count: poStatusDistribution['ORDERED'], color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/60' },
            { status: 'RECEIVED', label: 'Stock Received', count: poStatusDistribution['RECEIVED'], color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/60' },
          ].map((stage) => (
            <button
              key={stage.status}
              onClick={() => setPoFilter(stage.status)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                poFilter === stage.status
                  ? `${stage.border} bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30`
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stage.label}
              </span>
              <span className={`text-xl font-extrabold font-mono mt-2 ${stage.color}`}>
                {stage.count}
              </span>
            </button>
          ))}
        </div>

        {/* POs Stream Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Transition</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPurchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No purchase orders found matching '{poFilter}'.
                  </td>
                </tr>
              ) : (
                filteredPurchaseOrders.slice(0, 5).map((po) => {
                  const isUpdating = updatingPoId === po.id;
                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {po.purchaseOrderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {po.supplier?.name || `Vendor #${po.supplierId}`}
                        </div>
                        <div className="text-[11px] text-slate-400">{po.supplier?.contactPerson || 'Direct Supply'}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        ${Number(po.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : po.status === 'ORDERED'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                              : po.status === 'APPROVED'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.status === 'PENDING' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleQuickPoStatusChange(po, 'APPROVED')}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                          >
                            {isUpdating ? '...' : 'Approve PO'}
                          </button>
                        )}
                        {po.status === 'APPROVED' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleQuickPoStatusChange(po, 'ORDERED')}
                            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[11px] font-bold rounded-lg border border-purple-200 dark:border-purple-800 transition cursor-pointer"
                          >
                            {isUpdating ? '...' : 'Mark Ordered'}
                          </button>
                        )}
                        {po.status === 'ORDERED' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleQuickPoStatusChange(po, 'RECEIVED')}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                          >
                            {isUpdating ? '...' : 'Receive Stock'}
                          </button>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Stock Restocked
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="View PO Details"
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

      {/* Multi-Warehouse Distribution & Fleet Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouses Capacity Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Warehouse Fleet Capacity & Allocation
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time stock balance across regional distribution hubs
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/warehouses')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Hubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {warehouseBreakdown.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                No warehouses configured yet.
              </div>
            ) : (
              warehouseBreakdown.map((wh) => {
                const totalUnits = wh.totalQuantity || 0;
                const capacity = wh.capacity || 10000;
                const pct = Math.min(100, Math.round((totalUnits / capacity) * 100));

                return (
                  <div
                    key={wh.id}
                    onClick={() => navigate('/inventory')}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-sky-500" />
                          <span>{wh.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {wh.address || 'Central Distribution Hub'}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {wh.status || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Stock Volume:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-white">
                          {totalUnits.toLocaleString()} / {capacity.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct > 85 ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Unique SKUs: {wh.itemCount}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                        Inspect <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* System Staff & Operators Directory Glance (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Staff & Access Control</h3>
                  <p className="text-xs text-slate-400">Operators & system administrators</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                {usersList.length} Accounts
              </span>
            </div>

            <div className="space-y-3">
              {usersList.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {u.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                    {user?.id !== u.id && (
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className="block text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold mt-1 cursor-pointer"
                        title={u.enabled ? 'Click to disable' : 'Click to enable'}
                      >
                        {u.enabled ? 'Active • Disable' : 'Disabled • Enable'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onSwitchToUserView || (() => navigate('/dashboard/user'))}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Operator View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Platform Orders & Inventory Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent High-Value Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Customer Orders</h3>
                <p className="text-xs text-slate-400">Live transaction stream across all store operators</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No customer orders recorded for this period.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(-6).reverse().map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => navigate(`/orders/${ord.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ord.customer?.name || 'Walk-in Customer'}
                        </span>
                        <div className="text-[11px] text-slate-400">{ord.customer?.email || 'Store transaction'}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        ${Number(ord.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : ord.status === 'PENDING'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${ord.id}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Reorder Center (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Replenishment Triggers</h3>
                  <p className="text-xs text-slate-400">Stock at or below reorder levels</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 cursor-pointer"
              >
                Stock List
              </button>
            </div>

            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Healthy Stock</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All warehouse inventories are currently above safe threshold.</p>
                </div>
              ) : (
                lowStockItems.slice(0, 5).map((inv) => {
                  const avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
                  const isOut = avail <= 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {inv.product?.name || `Product #${inv.productId}`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          SKU: {inv.product?.sku || 'N/A'} • {inv.warehouse?.name || 'Hub'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono ${
                            isOut
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {avail} left (min: {inv.reorderLevel || 10})
                        </span>
                        <button
                          onClick={() => navigate('/purchase-orders/add')}
                          className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mt-1 cursor-pointer"
                        >
                          + Issue PO
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <button
              onClick={() => navigate('/purchase-orders/add')}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Create Procurement Purchase Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
