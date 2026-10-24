import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  Search,
  Truck,
  ArrowRight,
  Boxes,
  Users,
  Eye,
  ArrowUpRight,
  Check,
  AlertCircle,
  TrendingUp,
  Tag,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import warehouseService from '../../services/warehouseService';
import inventoryService from '../../services/inventoryService';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Interactive Live SKU Checker search
  const [skuSearchQuery, setSkuSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Order fulfillment queue filter
  const [fulfillmentFilter, setFulfillmentFilter] = useState('PENDING');
  const [advancingOrderId, setAdvancingOrderId] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchUserData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError('');

      const [prods, whs, invs, ords, custs] = await Promise.all([
        productService.getAllProducts().catch(() => []),
        warehouseService.getAllWarehouses().catch(() => []),
        inventoryService.getAllInventory().catch(() => []),
        orderService.getAllOrders().catch(() => []),
        customerService.getAllCustomers().catch(() => []),
      ]);

      setProducts(prods || []);
      setWarehouses(whs || []);
      setInventoryList(invs || []);
      setOrders(ords || []);
      setCustomers(custs || []);
    } catch (err) {
      setError('Failed to load operator workspace: ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Filter pending / actionable orders for this operator
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING'
    );
  }, [orders]);

  const fulfilledOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'DELIVERED');
  }, [orders]);

  // Categories list for quick filtering
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Product inventory map for instant stock lookup: productId -> total available units
  const productStockMap = useMemo(() => {
    const map = new Map();
    inventoryList.forEach((inv) => {
      const pid = inv.product?.id || inv.productId;
      if (pid) {
        const avail = (Number(inv.quantity) || 0) - (Number(inv.reservedQuantity) || 0);
        map.set(pid, (map.get(pid) || 0) + Math.max(0, avail));
      }
    });
    return map;
  }, [inventoryList]);

  // Live SKU checker filtered results
  const filteredProductsForLookup = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'ALL' || p.category === selectedCategory;
        const q = skuSearchQuery.trim().toLowerCase();
        if (!q) return matchesCategory;
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesCat = (p.category || '').toLowerCase().includes(q);
        return matchesCategory && (matchesName || matchesSku || matchesCat);
      })
      .slice(0, 6);
  }, [products, skuSearchQuery, selectedCategory]);

  // Actionable queue filtered
  const actionableOrders = useMemo(() => {
    if (fulfillmentFilter === 'ALL') return pendingOrders;
    return pendingOrders.filter((o) => o.status === fulfillmentFilter);
  }, [pendingOrders, fulfillmentFilter]);

  // Handle advancing an order status directly from dashboard
  const handleAdvanceOrderStatus = async (order) => {
    let nextStatus = 'CONFIRMED';
    if (order.status === 'PENDING') nextStatus = 'CONFIRMED';
    else if (order.status === 'CONFIRMED') nextStatus = 'PROCESSING';
    else if (order.status === 'PROCESSING') nextStatus = 'SHIPPED';
    else if (order.status === 'SHIPPED') nextStatus = 'DELIVERED';

    try {
      setAdvancingOrderId(order.id);
      await orderService.updateOrder(order.id, {
        ...order,
        status: nextStatus,
      });
      // Refresh silently
      await fetchUserData(true);
    } catch (err) {
      alert('Failed to advance order status: ' + (err.message || 'Error occurred'));
    } finally {
      setAdvancingOrderId(null);
    }
  };

  // Stock health overview
  const { lowStockItems } = useMemo(() => {
    let low = 0;
    let out = 0;
    let inst = 0;
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
        inst++;
      }
    });

    return {
      lowStockCount: low,
      outOfStockCount: out,
      inStockCount: inst,
      lowStockItems: items,
    };
  }, [inventoryList]);

  if (isLoading) {
    return <Loading message="Preparing operator workstation..." />;
  }

  return (
    <div className="space-y-6" id="user-dashboard-root">
      {/* Operator Station Hero Banner matching Aurora Blue / Royal Indigo palette */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#111827] p-6 sm:p-8 text-[#0f172a] dark:text-white shadow-sm border border-[#e2e8f0] dark:border-[#1e293b] transition-colors">
        {/* Glow ambient background effects */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-emerald-100/40 via-teal-50/20 to-transparent dark:from-teal-950/30 dark:via-emerald-950/15 dark:to-transparent pointer-events-none rounded-r-3xl" />
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34d399] border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Store Operator Workspace
              </span>
              <span className="text-[#64748b] dark:text-[#94a3b8] text-xs">• Station Ready</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f172a] dark:text-white">
              {getGreeting()}, {user?.name || 'Store Associate'}
            </h1>
            <p className="text-[#64748b] dark:text-[#94a3b8] text-sm mt-1.5 leading-relaxed">
              Order fulfillment station, live SKU stock check, and instant sales order processing.
            </p>

            {/* Quick stats mini-strip */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Action Queue:</span>
                <span className="font-bold text-[#f59e0b] font-mono">
                  {pendingOrders.length} Orders to Fulfill
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Completed Deliveries:</span>
                <span className="font-bold text-[#10b981]">{fulfilledOrders.length} Fulfilled</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155]">
                <span className="text-[#64748b] dark:text-[#94a3b8]">Catalog Ready:</span>
                <span className="font-bold text-[#06b6d4] dark:text-[#22d3ee]">{products.length} Products</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => fetchUserData(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-200 rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs transition cursor-pointer"
              title="Refresh Station Data"
              id="user-refresh-btn"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
              />
            </button>

            <button
              onClick={() => navigate('/customers/add')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-slate-700/80 active:scale-95 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-[#e2e8f0] dark:border-[#334155] shadow-2xs transition flex items-center gap-2 cursor-pointer"
              id="user-add-customer-btn"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Add Customer</span>
            </button>

            <button
              onClick={() => navigate('/orders/add')}
              className="px-4 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c3aed] dark:from-[#7c3aed] dark:to-[#a855f7] dark:hover:from-[#6d28d9] dark:hover:to-[#9333ea] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/25 dark:shadow-purple-900/30 transition flex items-center gap-2 cursor-pointer"
              id="user-create-order-btn"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Order</span>
            </button>
          </div>
        </div>
      </div>



      <ErrorMessage message={error} retry={() => fetchUserData(false)} onDismiss={() => setError('')} />

      {/* Operator KPIs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders To Fulfill */}
        <div
          onClick={() => {
            const el = document.getElementById('fulfillment-queue-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Pending Fulfillment
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#f59e0b] dark:text-[#f59e0b] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#f59e0b] font-mono">
              {pendingOrders.length}
            </span>
            <span className="text-xs text-[#f59e0b] font-semibold flex items-center gap-1">
              Active Queue <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Needs dispatch:</span>
            <span className="font-bold text-[#f59e0b]">Action Required</span>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Delivered Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#10b981] dark:text-[#34d399] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              {fulfilledOrders.length}
            </span>
            <span className="text-xs text-[#10b981] dark:text-[#34d399] font-semibold flex items-center gap-1">
              Completed <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Total Sales Volume:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">
              {orders.length} Total Orders
            </span>
          </div>
        </div>

        {/* Product Catalog Available */}
        <div
          onClick={() => navigate('/products')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Sellable SKUs
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#06b6d4] dark:text-[#22d3ee] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              {products.length}
            </span>
            <span className="text-xs text-[#06b6d4] dark:text-[#22d3ee] font-semibold flex items-center gap-1">
              Browse <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Categories active:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{categories.length}</span>
          </div>
        </div>

        {/* Registered Customers */}
        <div
          onClick={() => navigate('/customers')}
          className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-[#e2e8f0] dark:border-[#1e293b] shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
              Customer Directory
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#8b5cf6] dark:text-[#a855f7] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono">
              {customers.length}
            </span>
            <span className="text-xs text-[#8b5cf6] dark:text-[#a855f7] font-semibold flex items-center gap-1">
              Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Add client on the fly:</span>
            <span className="font-bold text-[#8b5cf6] dark:text-[#a855f7]">+ New</span>
          </div>
        </div>
      </div>

      {/* Interactive Tool 1: Live SKU & Stock Availability Checker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Live SKU & Stock Availability Checker
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Floor Utility
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Instantly check prices, available warehouse inventory, and add directly to a customer cart
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative my-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={skuSearchQuery}
            onChange={(e) => setSkuSearchQuery(e.target.value)}
            placeholder="Type SKU code, product name, or barcode to check real-time stock..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            id="user-sku-search-input"
          />
        </div>

        {/* SKU Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProductsForLookup.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No products found matching your search.
            </div>
          ) : (
            filteredProductsForLookup.map((prod) => {
              const availableUnits = productStockMap.get(prod.id) || 0;
              const isLow = availableUnits > 0 && availableUnits <= 10;
              const isOut = availableUnits <= 0;

              return (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 truncate">SKU: {prod.sku}</p>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white shrink-0">
                        ${Number(prod.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                        {prod.category || 'General'}
                      </span>
                      <span
                        className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          isOut
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : isLow
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {availableUnits} Units Available
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {isOut ? 'Out of stock' : 'Ready to dispatch'}
                    </span>
                    <button
                      onClick={() => navigate('/orders/add')}
                      disabled={isOut}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                        isOut
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Order</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Tool 2: Order Fulfillment Queue (Interactive Workflow) */}
      <div
        id="fulfillment-queue-section"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Order Fulfillment Queue & Dispatch Pipeline
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  {pendingOrders.length} In-Queue
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Advance customer orders step-by-step from confirmed payment to dispatch
              </p>
            </div>
          </div>

          {/* Status Stage Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'PENDING', label: 'Pending' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'ALL', label: 'All Open' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFulfillmentFilter(st.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  fulfillmentFilter === st.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actionable Orders Stream Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {actionableOrders.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Fulfillment Queue Clear!</p>
              <p className="text-xs text-slate-400 mt-1">
                No orders currently waiting in '{fulfillmentFilter}' state. Great job!
              </p>
            </div>
          ) : (
            actionableOrders.map((ord) => {
              const isUpdating = advancingOrderId === ord.id;
              let nextActionLabel = 'Confirm Order';
              let nextActionColor = 'bg-blue-600 hover:bg-blue-700 text-white';

              if (ord.status === 'CONFIRMED') {
                nextActionLabel = 'Start Processing';
                nextActionColor = 'bg-indigo-600 hover:bg-indigo-700 text-white';
              } else if (ord.status === 'PROCESSING') {
                nextActionLabel = 'Dispatch / Ship';
                nextActionColor = 'bg-purple-600 hover:bg-purple-700 text-white';
              } else if (ord.status === 'SHIPPED') {
                nextActionLabel = 'Mark Delivered';
                nextActionColor = 'bg-emerald-600 hover:bg-emerald-700 text-white';
              }

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {ord.customer?.name || 'Walk-in Customer'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{ord.customer?.email || 'In-store checkout'}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Total Amount:</span>
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        ${Number(ord.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/orders/${ord.id}`)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      disabled={isUpdating}
                      onClick={() => handleAdvanceOrderStatus(ord)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${nextActionColor}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'Updating...' : nextActionLabel}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Orders & Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Customer Sales</h3>
                <p className="text-xs text-slate-400">Order stream processed across retail stations</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Order Book</span>
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
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No customer orders placed yet. Click "Create Customer Order" to get started.
                    </td>
                  </tr>
                ) : (
                  orders.slice(-6).reverse().map((ord) => (
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
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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

        {/* Floor Stock Watchlist (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Floor Stock Watchlist</h3>
                  <p className="text-xs text-slate-400">Notice for store staff & cashiers</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                All Stock
              </button>
            </div>

            <div className="p-4 space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All SKUs in Stock</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Floor shelves and warehouses are well stocked.</p>
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
                          {avail} Left
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <button
              onClick={() => navigate('/orders/add')}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create Customer Order Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
