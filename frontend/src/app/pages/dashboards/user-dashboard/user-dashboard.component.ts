import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { InventoryService } from '../../../services/inventory.service';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { Product, Warehouse, Inventory, Order, Customer, OrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-7">
      <!-- Operator Station Banner (Consistent Purple Gradient) -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B2EE6] via-[#6C3BFF] to-[#7C3AED] p-6 sm:p-8 xl:p-10 text-white shadow-xl dark:shadow-2xl border border-white/10">
        <!-- Ambient decorative shapes -->
        <div class="absolute -right-16 -top-16 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-80 h-80 bg-[#38BDF8]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/20 text-white border border-white/20">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Store Operator Workspace
              </span>
              <span class="text-white/80 text-xs">• Station Telemetry Live</span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {{ getGreeting() }}, {{ authService.currentUser()?.name || 'Store Associate' }}
            </h1>
            <p class="text-white/80 text-sm mt-1.5 leading-relaxed">
              Order fulfillment station, live SKU stock check, and instant sales order processing.
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20">
                <span class="text-white/80">Action Queue:</span>
                <span class="font-bold text-amber-300 font-mono">{{ pendingOrders.length }} Orders to Fulfill</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20">
                <span class="text-white/80">Completed Deliveries:</span>
                <span class="font-bold text-emerald-300">{{ deliveredOrders.length }} Fulfilled</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20">
                <span class="text-white/80">Catalog Ready:</span>
                <span class="font-bold text-cyan-200">{{ products.length }} Products</span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              (click)="loadData(true)"
              [disabled]="isRefreshing"
              class="p-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl border border-white/20 transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <app-icon name="refresh" [className]="'w-4 h-4 ' + (isRefreshing ? 'animate-spin text-white' : '')"></app-icon>
            </button>

            <button
              (click)="router.navigate(['/customers/add'])"
              class="px-4 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="users" className="w-4 h-4 text-cyan-200"></app-icon>
              <span>New Customer</span>
            </button>

            <button
              (click)="router.navigate(['/orders/add'])"
              class="px-5 py-3 bg-white text-[#6C3BFF] hover:bg-slate-50 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-black/10 transition flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="shopping-cart" className="w-4 h-4"></app-icon>
              <span>Create Customer Order</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Operator KPIs Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Pending Orders -->
        <div class="bg-white dark:bg-[#141A2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] hover:border-[#F59E0B]/50 transition-colors shadow-xs card-hover-elevate cursor-pointer">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Pending Fulfillment</span>
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <app-icon name="clock" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-amber-500 font-mono">{{ pendingOrders.length }}</span>
            <span class="text-xs text-amber-500 font-semibold flex items-center gap-1">Action Required</span>
          </div>
          <div class="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#252C45] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
            <span>Needs packaging / dispatch</span>
            <span class="font-bold text-amber-500">Active</span>
          </div>
        </div>

        <!-- Delivered Orders -->
        <div class="bg-white dark:bg-[#141A2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] hover:border-[#22C55E]/50 transition-colors shadow-xs card-hover-elevate cursor-pointer">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Delivered Orders</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <app-icon name="check-circle" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">{{ deliveredOrders.length }}</span>
            <span class="text-xs text-emerald-500 font-semibold">Completed</span>
          </div>
          <div class="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#252C45] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
            <span>Total Orders:</span>
            <span class="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ orders.length }}</span>
          </div>
        </div>

        <!-- Sellable SKUs -->
        <div (click)="router.navigate(['/products'])" class="bg-white dark:bg-[#141A2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] hover:border-[#6C3BFF]/50 transition-colors shadow-xs card-hover-elevate cursor-pointer">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Sellable SKUs</span>
            <div class="w-10 h-10 rounded-xl bg-[#6C3BFF]/10 text-[#6C3BFF] flex items-center justify-center">
              <app-icon name="package" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">{{ products.length }}</span>
            <span class="text-xs text-[#6C3BFF] font-semibold">Browse</span>
          </div>
          <div class="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#252C45] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
            <span>Categories active:</span>
            <span class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ categories.length }}</span>
          </div>
        </div>

        <!-- Customer Directory -->
        <div (click)="router.navigate(['/customers'])" class="bg-white dark:bg-[#141A2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] hover:border-[#2563EB]/50 transition-colors shadow-xs card-hover-elevate cursor-pointer">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Customer Directory</span>
            <div class="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
              <app-icon name="users" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">{{ customers.length }}</span>
            <span class="text-xs text-[#2563EB] font-semibold">Directory</span>
          </div>
          <div class="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#252C45] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
            <span>Register client:</span>
            <span class="font-bold text-[#2563EB]">+ New</span>
          </div>
        </div>
      </div>

      <!-- Live SKU & Stock Availability Checker -->
      <div class="bg-white dark:bg-[#141A2E] rounded-3xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs p-6 sm:p-7">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#252C45] gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#6C3BFF]/10 text-[#6C3BFF] flex items-center justify-center">
              <app-icon name="search" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                Live SKU & Stock Availability Checker
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#6C3BFF]/10 text-[#6C3BFF]">
                  Floor Utility
                </span>
              </h3>
              <p class="text-xs text-[#475569] dark:text-[#94A3B8]">Instantly check prices, available warehouse inventory, and add directly to a customer cart</p>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              (click)="selectedCategory = 'ALL'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
              [ngClass]="selectedCategory === 'ALL' ? 'bg-[#6C3BFF] text-white shadow-xs' : 'bg-[#F8FAFC] dark:bg-[#11172B] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-[#252C45]'"
            >
              All Categories
            </button>
            @for (cat of categories.slice(0, 4); track cat) {
              <button
                (click)="selectedCategory = cat"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
                [ngClass]="selectedCategory === cat ? 'bg-[#6C3BFF] text-white shadow-xs' : 'bg-[#F8FAFC] dark:bg-[#11172B] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-[#252C45]'"
              >
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative my-4">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Type SKU code, product name, or category to check real-time stock..."
            class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
          />
        </div>

        <!-- SKU Results Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @if (filteredProducts.length === 0) {
            <div class="col-span-full py-8 text-center text-[#94A3B8] dark:text-[#64748B] text-xs">
              No products found matching your search.
            </div>
          } @else {
            @for (prod of filteredProducts; track prod.id) {
              <div class="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC]/50 dark:bg-[#10152A]/50 hover:bg-[#F5F3FF]/40 dark:hover:bg-[#1B2140]/50 transition-colors flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h4 class="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">{{ prod.name }}</h4>
                      <p class="text-[11px] font-mono text-[#6C3BFF] dark:text-[#A78BFA] truncate">SKU: {{ prod.sku }}</p>
                    </div>
                    <span class="font-mono font-extrabold text-sm text-[#0F172A] dark:text-[#F8FAFC] shrink-0">
                      \${{ (prod.price || 0) | number:'1.2-2' }}
                    </span>
                  </div>

                  <div class="mt-2.5 flex items-center justify-between">
                    <span class="text-[10px] uppercase font-semibold text-[#475569] dark:text-[#94A3B8] bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      {{ prod.category }}
                    </span>
                    <span
                      class="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full"
                      [ngClass]="getAvailableUnits(prod.id) <= 0 ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'"
                    >
                      {{ getAvailableUnits(prod.id) }} Units Available
                    </span>
                  </div>
                </div>

                <div class="mt-3 pt-2.5 border-t border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-between">
                  <span class="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {{ getAvailableUnits(prod.id) <= 0 ? 'Out of stock' : 'Ready to dispatch' }}
                  </span>
                  <button
                    (click)="router.navigate(['/orders/add'])"
                    [disabled]="getAvailableUnits(prod.id) <= 0"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer bg-[#6C3BFF]/10 text-[#6C3BFF] hover:bg-[#6C3BFF]/20 border border-[#6C3BFF]/25 disabled:opacity-40"
                  >
                    <app-icon name="plus" className="w-3 h-3"></app-icon>
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Order Fulfillment Queue & Dispatch Pipeline -->
      <div class="bg-white dark:bg-[#141A2E] rounded-3xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs p-6 sm:p-7">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#252C45] gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <app-icon name="shopping-cart" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                Order Fulfillment Queue & Dispatch Pipeline
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                  {{ pendingOrders.length }} In-Queue
                </span>
              </h3>
              <p class="text-xs text-[#475569] dark:text-[#94A3B8]">Advance customer orders step-by-step from confirmed payment to dispatch</p>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#11172B] p-1 rounded-xl border border-[#E2E8F0] dark:border-[#252C45]">
            @for (st of fulfillmentFilters; track st.id) {
              <button
                (click)="fulfillmentFilter = st.id"
                class="px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer"
                [ngClass]="fulfillmentFilter === st.id ? 'bg-[#6C3BFF] text-white shadow-xs' : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'"
              >
                {{ st.label }}
              </button>
            }
          </div>
        </div>

        <!-- Actionable Orders Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-6">
          @if (actionableOrders.length === 0) {
            <div class="col-span-full py-12 text-center text-[#94A3B8] dark:text-[#64748B]">
              <app-icon name="check-circle" className="w-10 h-10 text-emerald-500 mx-auto mb-2"></app-icon>
              <p class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Fulfillment Queue Clear!</p>
              <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">No orders currently waiting in '{{ fulfillmentFilter }}' state.</p>
            </div>
          } @else {
            @for (ord of actionableOrders; track ord.id) {
              <div class="p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC]/50 dark:bg-[#10152A]/50 flex flex-col justify-between gap-3 shadow-xs hover:border-[#6C3BFF]/40 transition-colors">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-xs text-[#6C3BFF] dark:text-[#A78BFA]">{{ ord.orderNumber }}</span>
                    <span
                      class="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      [ngClass]="ord.status === 'PENDING' ? 'bg-amber-500/15 text-amber-500' : (ord.status === 'CONFIRMED' ? 'bg-blue-500/15 text-blue-500' : 'bg-purple-500/15 text-[#6C3BFF]')"
                    >
                      {{ ord.status }}
                    </span>
                  </div>

                  <div class="mt-2">
                    <h4 class="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{{ ord.customer?.name || 'Customer' }}</h4>
                    <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">{{ ord.customer?.email || 'Walk-in checkout' }}</p>
                  </div>

                  <div class="mt-3 flex items-center justify-between text-xs text-[#475569] dark:text-[#94A3B8]">
                    <span>Total Amount:</span>
                    <span class="font-mono font-extrabold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      \${{ (ord.totalAmount || 0) | number:'1.2-2' }}
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-between gap-2">
                  <button
                    (click)="router.navigate(['/orders', ord.id])"
                    class="px-3 py-1.5 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <app-icon name="eye" className="w-3.5 h-3.5"></app-icon>
                    <span>Details</span>
                  </button>

                  <button
                    (click)="advanceOrderStatus(ord)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white"
                  >
                    <app-icon name="check" className="w-3.5 h-3.5"></app-icon>
                    <span>{{ getNextActionLabel(ord.status) }}</span>
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class UserDashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private inventoryService = inject(InventoryService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);

  isLoading = true;
  isRefreshing = false;
  searchQuery = '';
  selectedCategory = 'ALL';
  fulfillmentFilter: string = 'PENDING';

  products: Product[] = [];
  warehouses: Warehouse[] = [];
  inventoryList: Inventory[] = [];
  orders: Order[] = [];
  customers: Customer[] = [];
  stockMap = new Map<number, number>();

  fulfillmentFilters = [
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'ALL', label: 'All Open' }
  ];

  get pendingOrders(): Order[] {
    return this.orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PROCESSING');
  }

  get deliveredOrders(): Order[] {
    return this.orders.filter(o => o.status === 'DELIVERED');
  }

  get categories(): string[] {
    const set = new Set<string>();
    this.products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }

  get filteredProducts(): Product[] {
    return this.products
      .filter(p => {
        const matchesCategory = this.selectedCategory === 'ALL' || p.category === this.selectedCategory;
        const q = this.searchQuery.trim().toLowerCase();
        if (!q) return matchesCategory;
        return matchesCategory && ((p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
      })
      .slice(0, 6);
  }

  get actionableOrders(): Order[] {
    if (this.fulfillmentFilter === 'ALL') return this.pendingOrders;
    return this.pendingOrders.filter(o => o.status === this.fulfillmentFilter);
  }

  ngOnInit() {
    this.loadData();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  loadData(silent = false) {
    if (!silent) this.isLoading = true;
    else this.isRefreshing = true;

    forkJoin({
      prods: this.productService.getAllProducts().pipe(catchError(() => of([]))),
      whs: this.warehouseService.getAllWarehouses().pipe(catchError(() => of([]))),
      invs: this.inventoryService.getAllInventory().pipe(catchError(() => of([]))),
      ords: this.orderService.getAllOrders().pipe(catchError(() => of([]))),
      custs: this.customerService.getAllCustomers().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        const hasLiveProds = Array.isArray(res.prods) && res.prods.length > 0;
        const hasLiveOrds = Array.isArray(res.ords) && res.ords.length > 0;

        if (hasLiveProds) this.products = res.prods;
        if (Array.isArray(res.whs) && res.whs.length > 0) this.warehouses = res.whs;
        if (Array.isArray(res.invs) && res.invs.length > 0) this.inventoryList = res.invs;
        if (hasLiveOrds) this.orders = res.ords;
        if (Array.isArray(res.custs) && res.custs.length > 0) this.customers = res.custs;

        if (this.products.length === 0 || this.orders.length === 0) {
          this.applyDefaultSeedData();
        }

        // Build stock map
        this.stockMap.clear();
        this.inventoryList.forEach(inv => {
          const pid = inv.product?.id || inv.productId;
          if (pid) {
            const avail = (Number(inv.quantity) || 0) - (Number(inv.reservedQuantity) || 0);
            this.stockMap.set(pid, (this.stockMap.get(pid) || 0) + Math.max(0, avail));
          }
        });

        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();
      },
      error: () => {
        if (this.products.length === 0 || this.orders.length === 0) {
          this.applyDefaultSeedData();
        }
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyDefaultSeedData() {
    this.products = [
      { id: 5, name: 'Dell Inspiron 15 Laptop', sku: 'PROD-ELEC-001', category: 'Electronics', price: 749.99, unitCost: 620, reorderLevel: 10, status: 'ACTIVE' },
      { id: 6, name: 'Logitech MX Master 3S Mouse', sku: 'PROD-ELEC-002', category: 'Accessories', price: 99.99, unitCost: 72, reorderLevel: 20, status: 'ACTIVE' },
      { id: 7, name: 'Sony WH-1000XM5 Headphones', sku: 'PROD-ELEC-003', category: 'Audio', price: 399.99, unitCost: 310, reorderLevel: 10, status: 'ACTIVE' },
      { id: 8, name: 'Samsung 27-inch 4K Monitor', sku: 'PROD-ELEC-004', category: 'Displays', price: 299.99, unitCost: 235, reorderLevel: 8, status: 'ACTIVE' },
      { id: 9, name: 'Ergonomic Mesh Office Chair', sku: 'PROD-OFF-005', category: 'Furniture', price: 189.50, unitCost: 130, reorderLevel: 10, status: 'ACTIVE' },
      { id: 10, name: 'Motorized Standing Desk', sku: 'PROD-OFF-006', category: 'Furniture', price: 449.00, unitCost: 340, reorderLevel: 5, status: 'ACTIVE' }
    ];

    this.orders = [
      { id: 6, orderNumber: 'ORD-2026-105', customer: { id: 7, name: 'Arjun Kapoor', email: 'arjun.kapoor@gmail.com', phone: '+91-9811443322', address: '12, Golf Links Road', city: 'New Delhi', state: 'Delhi', pincode: '110003' }, orderDate: new Date().toISOString(), status: 'PENDING', totalAmount: 449.00, shippingAddress: '12, Golf Links Road, New Delhi', orderItems: [{ productId: 10, quantity: 1, unitPrice: 449.00 }] },
      { id: 5, orderNumber: 'ORD-2026-104', customer: { id: 6, name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91-9849001122', address: 'Plot 88, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' }, orderDate: new Date().toISOString(), status: 'CONFIRMED', totalAmount: 199.98, shippingAddress: 'Plot 88, Jubilee Hills Road 36, Hyderabad', orderItems: [{ productId: 6, quantity: 2, unitPrice: 99.99 }] },
      { id: 4, orderNumber: 'ORD-2026-103', customer: { id: 5, name: 'Rajesh Patel', email: 'rajesh.patel@gmail.com', phone: '+91-9820556677', address: 'B-304, Palm Beach', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' }, orderDate: new Date().toISOString(), status: 'PROCESSING', totalAmount: 789.48, shippingAddress: 'B-304, Palm Beach Heights, Navi Mumbai', orderItems: [{ productId: 5, quantity: 1, unitPrice: 749.99 }] },
      { id: 2, orderNumber: 'ORD-2026-101', customer: { id: 3, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9876543210', address: 'Flat 402, Green Valley', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' }, orderDate: new Date().toISOString(), status: 'DELIVERED', totalAmount: 849.98, shippingAddress: 'Flat 402, Green Valley, Noida', orderItems: [{ productId: 5, quantity: 1, unitPrice: 749.99 }, { productId: 6, quantity: 1, unitPrice: 99.99 }] }
    ];

    this.customers = [
      { id: 3, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9876543210', address: 'Flat 402, Green Valley Apts', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      { id: 4, name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '+91-9830112244', address: '15B Southern Avenue', city: 'Kolkata', state: 'West Bengal', pincode: '700029' },
      { id: 5, name: 'Rajesh Patel', email: 'rajesh.patel@gmail.com', phone: '+91-9820556677', address: 'B-304, Palm Beach Heights', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' },
      { id: 6, name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91-9849001122', address: 'Plot 88, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      { id: 7, name: 'Arjun Kapoor', email: 'arjun.kapoor@gmail.com', phone: '+91-9811443322', address: '12, Golf Links Road', city: 'New Delhi', state: 'Delhi', pincode: '110003' }
    ];

    this.warehouses = [
      { id: 2, name: 'Delhi Northern Distribution Hub', address: 'Khasra 45, NH-8, Kapashera', capacity: 50000, contactNumber: '+91-9811001122', status: 'ACTIVE' },
      { id: 3, name: 'Bangalore Southern Tech Logistics', address: 'Plot 12B, Electronic City Phase 1', capacity: 75000, contactNumber: '+91-9845012345', status: 'ACTIVE' },
      { id: 4, name: 'Mumbai Western Fulfillment Center', address: 'Bhiwandi Logistics Park, Sector 4', capacity: 60000, contactNumber: '+91-9820055443', status: 'ACTIVE' }
    ];

    this.inventoryList = [
      { id: 2, productId: 5, quantity: 45, reservedQuantity: 5 },
      { id: 3, productId: 6, quantity: 120, reservedQuantity: 10 },
      { id: 4, productId: 7, quantity: 8, reservedQuantity: 2 },
      { id: 5, productId: 10, quantity: 3, reservedQuantity: 3 },
      { id: 7, productId: 8, quantity: 25, reservedQuantity: 5 },
      { id: 9, productId: 9, quantity: 40, reservedQuantity: 4 }
    ];
  }

  getAvailableUnits(productId: number): number {
    return this.stockMap.get(productId) || 0;
  }

  getNextActionLabel(status: OrderStatus): string {
    if (status === 'PENDING') return 'Confirm Order';
    if (status === 'CONFIRMED') return 'Start Processing';
    if (status === 'PROCESSING') return 'Dispatch / Ship';
    if (status === 'SHIPPED') return 'Mark Delivered';
    return 'Next Stage';
  }

  advanceOrderStatus(order: Order) {
    let nextStatus: OrderStatus = 'CONFIRMED';
    if (order.status === 'PENDING') nextStatus = 'CONFIRMED';
    else if (order.status === 'CONFIRMED') nextStatus = 'PROCESSING';
    else if (order.status === 'PROCESSING') nextStatus = 'SHIPPED';
    else if (order.status === 'SHIPPED') nextStatus = 'DELIVERED';

    this.orderService.updateOrder(order.id, { ...order, status: nextStatus }).subscribe({
      next: () => this.loadData(true)
    });
  }
}
