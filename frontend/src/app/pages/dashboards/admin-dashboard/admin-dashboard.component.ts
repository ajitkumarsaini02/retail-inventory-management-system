import { Component, EventEmitter, Output, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { InventoryService } from '../../../services/inventory.service';
import { OrderService } from '../../../services/order.service';
import { SupplierService } from '../../../services/supplier.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { UserService } from '../../../services/user.service';
import { Product, Warehouse, Inventory, Order, Supplier, PurchaseOrder, User } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Executive Command Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <!-- Glow ambient background effects -->
        <div class="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="max-w-2xl">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {{ getGreeting() }}, {{ authService.currentUser()?.name || 'Ajit Kumar' }}
            </h1>
            <p class="text-slate-300 text-sm mt-1.5 leading-relaxed">
              Real-time telemetry on inventory availability, customer fulfillment pipelines, and supply chain logistics.
            </p>

            <!-- Quick stats mini-strip inside hero -->
            <div class="mt-5 flex flex-wrap items-center gap-4 text-xs">
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="text-slate-400">Fulfillment Rate:</span>
                <span class="font-bold text-emerald-400">{{ fulfillmentRate }}%</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="text-slate-400">Total Volume:</span>
                <span class="font-bold text-white font-mono">
                  {{ totalStockUnits.toLocaleString() }} Units
                </span>
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="text-slate-400">Active Warehouses:</span>
                <span class="font-bold text-indigo-300">{{ warehouses.length }} Hubs</span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              (click)="loadData(true)"
              [disabled]="isRefreshing"
              class="p-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-xl backdrop-blur-xs border border-white/10 transition cursor-pointer"
              title="Refresh Analytics"
            >
              <app-icon name="refresh" [className]="'w-4 h-4 ' + (isRefreshing ? 'animate-spin text-indigo-400' : '')"></app-icon>
            </button>

            <button
              (click)="router.navigate(['/orders/add'])"
              class="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <app-icon name="shopping-cart" className="w-4 h-4"></app-icon>
              <span>Create Order</span>
            </button>

            <button
              (click)="router.navigate(['/products/add'])"
              class="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/10 transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <app-icon name="plus" className="w-4 h-4"></app-icon>
              <span>Add SKU</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Critical Stock Alert Banner -->
      @if (lowStockItems.length > 0) {
        <div class="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <app-icon name="alert-triangle" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <h4 class="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: {{ lowStockItems.length }} inventory item{{ lowStockItems.length > 1 ? 's' : '' }} below reorder threshold
              </h4>
              <p class="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Supply risk detected. Review items and place purchase replenishment orders to prevent fulfillment delays.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              (click)="router.navigate(['/inventory'])"
              class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Review Stock Alerts
            </button>
            <button
              (click)="router.navigate(['/purchase-orders/add'])"
              class="px-3.5 py-2 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Create PO
            </button>
          </div>
        </div>
      }

      <!-- Primary KPI Cards Grid (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Product Catalog -->
        <div
          (click)="router.navigate(['/products'])"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Product Catalog
            </span>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="package" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {{ products.length }}
            </span>
            <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              Active SKUs <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </span>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Standardized pricing</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-medium">100% cataloged</span>
          </div>
        </div>

        <!-- Warehouses -->
        <div
          (click)="router.navigate(['/warehouses'])"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Warehouses
            </span>
            <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="warehouse" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {{ warehouses.length }}
            </span>
            <span class="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1">
              Distribution Hubs <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </span>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Multi-facility mesh</span>
            <span class="text-sky-600 dark:text-sky-400 font-medium">Operational</span>
          </div>
        </div>

        <!-- Total Sales Orders -->
        <div
          (click)="router.navigate(['/orders'])"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Sales Orders
            </span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="shopping-cart" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {{ orders.length }}
            </span>
            <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              Fulfillment <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </span>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Total Gross Value</span>
            <span class="text-slate-900 dark:text-white font-bold font-mono">
              \${{ totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>

        <!-- Pending Orders -->
        <div
          (click)="router.navigate(['/orders'])"
          class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Orders
            </span>
            <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="clock" className="w-5 h-5"></app-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {{ pendingOrderCount }}
            </span>
            <span class="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              Needs dispatch <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </span>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>Fulfillment Status</span>
            <span class="text-amber-600 dark:text-amber-400 font-bold">
              {{ pendingOrderCount > 0 ? 'Action Queue' : 'Queue Clear' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Secondary Metrics Strip (3 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total Units in Stock -->
        <div
          (click)="router.navigate(['/inventory'])"
          class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="boxes" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Units in Stock
              </p>
              <p class="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {{ totalStockUnits.toLocaleString() }}
              </p>
              <p class="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                {{ reservedStockUnits }} units reserved for open orders
              </p>
            </div>
          </div>
          <app-icon name="arrow-up-right" className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition"></app-icon>
        </div>

        <!-- Verified Suppliers -->
        <div
          (click)="router.navigate(['/suppliers'])"
          class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="truck" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Verified Suppliers
              </p>
              <p class="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {{ suppliers.length }}
              </p>
              <p class="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                Active supply vendor partners
              </p>
            </div>
          </div>
          <app-icon name="arrow-up-right" className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition"></app-icon>
        </div>

        <!-- Procurement Orders -->
        <div
          (click)="router.navigate(['/purchase-orders'])"
          class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs card-hover-elevate cursor-pointer group flex items-center justify-between transition-colors"
        >
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <app-icon name="file-spreadsheet" className="w-5 h-5"></app-icon>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Procurement Orders
              </p>
              <p class="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {{ purchaseOrders.length }}
              </p>
              <p class="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                In-flight supplier PO receipts
              </p>
            </div>
          </div>
          <app-icon name="arrow-up-right" className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition"></app-icon>
        </div>
      </div>

      <!-- Middle Grid: Order Fulfillment Pipeline & Inventory Health -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Order Fulfillment Pipeline (2 cols) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <app-icon name="trending-up" className="w-4 h-4"></app-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                    Order Fulfillment Pipeline
                  </h3>
                  <p class="text-xs text-slate-400">
                    Live distribution stages across customer orders
                  </p>
                </div>
              </div>
              <button
                (click)="router.navigate(['/orders'])"
                class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Orders Manager</span>
                <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
              </button>
            </div>

            <!-- Visual stage cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-5">
              @for (st of pipelineStages; track st.status) {
                <div
                  class="p-3 rounded-xl border flex flex-col items-center justify-center text-center"
                  [ngClass]="st.bg + ' ' + st.border"
                >
                  <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ st.status }}
                  </span>
                  <span class="text-lg font-extrabold font-mono mt-1" [ngClass]="st.text">
                    {{ orderStatusDistribution[st.status] || 0 }}
                  </span>
                </div>
              }
            </div>

            <!-- Stacked bar visualization -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span class="font-semibold text-slate-700 dark:text-slate-300">Fulfillment Progression</span>
                <span class="font-mono text-slate-900 dark:text-white font-bold">
                  {{ orders.length }} Total Orders Recorded
                </span>
              </div>
              <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                @for (seg of barSegments; track seg.key) {
                  @if (getOrderStatusPct(seg.key) > 0) {
                    <div
                      [title]="seg.key + ': ' + (orderStatusDistribution[seg.key] || 0) + ' (' + Math.round(getOrderStatusPct(seg.key)) + '%)'"
                      class="h-full transition-all duration-500"
                      [ngClass]="seg.color"
                      [style.width.%]="getOrderStatusPct(seg.key)"
                    ></div>
                  }
                }
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Fulfilled Orders: {{ orderStatusDistribution['DELIVERED'] || 0 }}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>In-Queue / Pending: {{ pendingOrderCount }}</span>
            </span>
          </div>
        </div>

        <!-- Stock Health Radar Card (1 col) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <app-icon name="activity" className="w-4 h-4"></app-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">Inventory Health</h3>
                  <p class="text-xs text-slate-400">Stock availability analysis</p>
                </div>
              </div>
              <button
                (click)="router.navigate(['/inventory'])"
                class="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 cursor-pointer"
              >
                Inspect
              </button>
            </div>

            <div class="space-y-4">
              <!-- In stock -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    In Stock (Healthy)
                  </span>
                  <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ stockHealth.inStock }} SKUs
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="inStockPct"></div>
                </div>
              </div>

              <!-- Low stock -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    Low Stock (Below Reorder)
                  </span>
                  <span class="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {{ stockHealth.lowStock }} SKUs
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500 rounded-full" [style.width.%]="lowStockPct"></div>
                </div>
              </div>

              <!-- Out of stock -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    Out of Stock (Zero Available)
                  </span>
                  <span class="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {{ stockHealth.outOfStock }} SKUs
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500 rounded-full" [style.width.%]="outStockPct"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              (click)="router.navigate(['/inventory'])"
              class="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <span>Full Stock Audit</span>
              <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Grid: Recent Customer Orders & Stock Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Orders (2 cols) -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <app-icon name="shopping-cart" className="w-4 h-4"></app-icon>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">Recent Customer Orders</h3>
                <p class="text-xs text-slate-400">Latest sales orders & fulfillment statuses</p>
              </div>
            </div>
            <button
              (click)="router.navigate(['/orders'])"
              class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[540px] text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <th class="py-3 px-4">Order #</th>
                  <th class="py-3 px-4">Customer</th>
                  <th class="py-3 px-4 text-right">Amount</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                @if (recentOrders.length === 0) {
                  <tr>
                    <td colSpan="5" class="py-10 text-center text-slate-400 dark:text-slate-500">
                      No customer orders recorded yet.
                    </td>
                  </tr>
                } @else {
                  @for (ord of recentOrders; track ord.id) {
                    <tr
                      (click)="router.navigate(['/orders', ord.id])"
                      class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {{ ord.orderNumber }}
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {{ ord.customer?.name ? ord.customer.name.charAt(0) : 'C' }}
                          </div>
                          <span class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {{ ord.customer?.name || 'Walk-in Customer' }}
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                        \${{ (ord.totalAmount || 0) | number:'1.2-2' }}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full border"
                          [ngClass]="getOrderStatusBadgeClass(ord.status)"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            [ngClass]="ord.status === 'DELIVERED' ? 'bg-emerald-500' : (ord.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500')"
                          ></span>
                          {{ ord.status }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button
                          (click)="$event.stopPropagation(); router.navigate(['/orders', ord.id])"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="View Details"
                        >
                          <app-icon name="eye" className="w-4 h-4"></app-icon>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock Alerts (1 col) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <app-icon name="alert-triangle" className="w-4 h-4"></app-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">Stock Alerts</h3>
                  <p class="text-xs text-slate-400">At or below reorder levels</p>
                </div>
              </div>
              <button
                (click)="router.navigate(['/inventory'])"
                class="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 cursor-pointer"
              >
                View
              </button>
            </div>

            <div class="p-4 space-y-3">
              @if (lowStockItems.length === 0) {
                <div class="py-10 text-center text-slate-400 dark:text-slate-500">
                  <app-icon name="check-circle" className="w-8 h-8 text-emerald-500 mx-auto mb-2"></app-icon>
                  <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">Healthy Stock Status</p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    All SKUs are currently well above reorder limits.
                  </p>
                </div>
              } @else {
                @for (inv of lowStockItems.slice(0, 5); track inv.id) {
                  <div
                    class="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition flex items-center justify-between gap-3"
                  >
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ getProductName(inv) }}
                      </p>
                      <p class="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                        SKU: {{ getProductSku(inv) }} • {{ getWarehouseName(inv) }}
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <span
                        class="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono"
                        [ngClass]="getAvailableQuantity(inv) <= 0
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'"
                      >
                        {{ getAvailableQuantity(inv) }} left (min: {{ inv.reorderLevel || 10 }})
                      </span>
                      <button
                        (click)="router.navigate(['/purchase-orders/add'])"
                        class="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-1 cursor-pointer"
                      >
                        + Reorder PO
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <button
              (click)="router.navigate(['/inventory'])"
              class="w-full py-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage all warehouse inventory</span>
              <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  @Output() switchToUserView = new EventEmitter<void>();

  authService = inject(AuthService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private inventoryService = inject(InventoryService);
  private orderService = inject(OrderService);
  private supplierService = inject(SupplierService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private userService = inject(UserService);

  protected readonly Math = Math;

  isLoading = true;
  isRefreshing = false;

  products: Product[] = [];
  warehouses: Warehouse[] = [];
  inventoryList: Inventory[] = [];
  orders: Order[] = [];
  suppliers: Supplier[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  usersList: User[] = [];

  // Metrics
  totalRevenue = 0;
  totalStockUnits = 0;
  reservedStockUnits = 0;
  fulfillmentRate = 100;

  lowStockItems: any[] = [];
  outOfStockCount = 0;
  recentOrders: Order[] = [];
  orderStatusDistribution: Record<string, number> = {};
  stockHealth = { inStock: 0, lowStock: 0, outOfStock: 0 };
  inStockPct = 0;
  lowStockPct = 0;
  outStockPct = 0;

  pipelineStages = [
    { status: 'PENDING', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/50' },
    { status: 'CONFIRMED', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/50' },
    { status: 'PROCESSING', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900/50' },
    { status: 'SHIPPED', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-900/50' },
    { status: 'DELIVERED', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/50' },
    { status: 'CANCELLED', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/50' }
  ];

  barSegments = [
    { key: 'DELIVERED', color: 'bg-emerald-500' },
    { key: 'SHIPPED', color: 'bg-purple-500' },
    { key: 'PROCESSING', color: 'bg-indigo-500' },
    { key: 'CONFIRMED', color: 'bg-blue-500' },
    { key: 'PENDING', color: 'bg-amber-500' },
    { key: 'CANCELLED', color: 'bg-rose-500' }
  ];

  get pendingOrderCount(): number {
    return this.orders.filter(o => o.status === 'PENDING').length;
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

  retryCount = 0;

  loadData(silent = false) {
    if (!silent) this.isLoading = true;
    else this.isRefreshing = true;

    forkJoin({
      prods: this.productService.getAllProducts().pipe(catchError((err) => { console.warn('Prods fetch err:', err); return of([]); })),
      whs: this.warehouseService.getAllWarehouses().pipe(catchError((err) => { console.warn('Whs fetch err:', err); return of([]); })),
      invs: this.inventoryService.getAllInventory().pipe(catchError((err) => { console.warn('Invs fetch err:', err); return of([]); })),
      ords: this.orderService.getAllOrders().pipe(catchError((err) => { console.warn('Ords fetch err:', err); return of([]); })),
      supps: this.supplierService.getAllSuppliers().pipe(catchError((err) => { console.warn('Supps fetch err:', err); return of([]); })),
      pos: this.purchaseOrderService.getAllPurchaseOrders().pipe(catchError((err) => { console.warn('POs fetch err:', err); return of([]); })),
      users: this.userService.getAllUsers().pipe(catchError((err) => { console.warn('Users fetch err:', err); return of([]); }))
    }).subscribe({
      next: (res) => {
        const hasLiveProds = Array.isArray(res.prods) && res.prods.length > 0;
        const hasLiveOrds = Array.isArray(res.ords) && res.ords.length > 0;
        const hasLiveWhs = Array.isArray(res.whs) && res.whs.length > 0;

        if (hasLiveProds) this.products = res.prods;
        if (hasLiveWhs) this.warehouses = res.whs;
        if (Array.isArray(res.invs) && res.invs.length > 0) this.inventoryList = res.invs;
        if (hasLiveOrds) this.orders = res.ords;
        if (Array.isArray(res.supps) && res.supps.length > 0) this.suppliers = res.supps;
        if (Array.isArray(res.pos) && res.pos.length > 0) this.purchaseOrders = res.pos;
        if (Array.isArray(res.users) && res.users.length > 0) this.usersList = res.users;

        console.log('[Admin Dashboard] Live sync result:', {
          products: this.products.length,
          warehouses: this.warehouses.length,
          inventory: this.inventoryList.length,
          orders: this.orders.length,
          suppliers: this.suppliers.length,
          purchaseOrders: this.purchaseOrders.length
        });

        if (!hasLiveProds && !hasLiveOrds && this.retryCount < 3) {
          this.retryCount++;
          setTimeout(() => this.loadData(true), 3000);
        }

        if (this.products.length === 0 || this.orders.length === 0) {
          this.applyDefaultSeedData();
        }

        this.calculateMetrics();
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Admin Dashboard] forkJoin error:', err);
        if (this.products.length === 0 || this.orders.length === 0) {
          this.applyDefaultSeedData();
        }
        this.calculateMetrics();
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();

        if (this.retryCount < 3) {
          this.retryCount++;
          setTimeout(() => this.loadData(true), 3000);
        }
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
      { id: 10, name: 'Motorized Standing Desk', sku: 'PROD-OFF-006', category: 'Furniture', price: 449.00, unitCost: 340, reorderLevel: 5, status: 'ACTIVE' },
      { id: 11, name: 'TP-Link WiFi 6 Gigabit Router', sku: 'PROD-NET-007', category: 'Networking', price: 79.99, unitCost: 55, reorderLevel: 12, status: 'ACTIVE' },
      { id: 12, name: 'SanDisk 1TB Portable SSD', sku: 'PROD-STO-008', category: 'Storage', price: 119.99, unitCost: 85, reorderLevel: 10, status: 'ACTIVE' }
    ];

    this.warehouses = [
      { id: 2, name: 'Delhi Northern Distribution Hub', address: 'Khasra 45, NH-8, Kapashera', capacity: 50000, contactNumber: '+91-9811001122', status: 'ACTIVE' },
      { id: 3, name: 'Bangalore Southern Tech Logistics', address: 'Plot 12B, Electronic City Phase 1', capacity: 75000, contactNumber: '+91-9845012345', status: 'ACTIVE' },
      { id: 4, name: 'Mumbai Western Fulfillment Center', address: 'Bhiwandi Logistics Park, Sector 4', capacity: 60000, contactNumber: '+91-9820055443', status: 'ACTIVE' },
      { id: 5, name: 'Kolkata Eastern Regional Depot', address: 'Dankuni Industrial Zone, NH-2', capacity: 35000, contactNumber: '+91-9830099887', status: 'ACTIVE' }
    ];

    this.inventoryList = [
      { id: 2, productId: 5, quantity: 45, reservedQuantity: 10, reorderLevel: 5 },
      { id: 3, productId: 6, quantity: 120, reservedQuantity: 20, reorderLevel: 10 },
      { id: 4, productId: 7, quantity: 8, reservedQuantity: 10, reorderLevel: 2 },
      { id: 5, productId: 10, quantity: 3, reservedQuantity: 5, reorderLevel: 3 },
      { id: 7, productId: 8, quantity: 25, reservedQuantity: 8, reorderLevel: 5 },
      { id: 9, productId: 9, quantity: 40, reservedQuantity: 10, reorderLevel: 4 },
      { id: 11, productId: 11, quantity: 50, reservedQuantity: 12, reorderLevel: 5 }
    ];

    this.orders = [
      { id: 2, orderNumber: 'ORD-2026-101', customer: { id: 3, name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+91-9876543210', address: 'Flat 402, Green Valley', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' }, orderDate: new Date().toISOString(), status: 'DELIVERED', totalAmount: 849.98, shippingAddress: 'Flat 402, Green Valley, Noida', orderItems: [{ productId: 5, quantity: 1, unitPrice: 749.99 }, { productId: 6, quantity: 1, unitPrice: 99.99 }] },
      { id: 3, orderNumber: 'ORD-2026-102', customer: { id: 4, name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '+91-9830112244', address: '15B Southern Avenue', city: 'Kolkata', state: 'West Bengal', pincode: '700029' }, orderDate: new Date().toISOString(), status: 'SHIPPED', totalAmount: 399.99, shippingAddress: '15B Southern Avenue, Kolkata', orderItems: [{ productId: 7, quantity: 1, unitPrice: 399.99 }] },
      { id: 4, orderNumber: 'ORD-2026-103', customer: { id: 5, name: 'Rajesh Patel', email: 'rajesh.patel@gmail.com', phone: '+91-9820556677', address: 'B-304, Palm Beach', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' }, orderDate: new Date().toISOString(), status: 'PROCESSING', totalAmount: 789.48, shippingAddress: 'B-304, Palm Beach Heights, Navi Mumbai', orderItems: [{ productId: 5, quantity: 1, unitPrice: 749.99 }] },
      { id: 5, orderNumber: 'ORD-2026-104', customer: { id: 6, name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '+91-9849001122', address: 'Plot 88, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' }, orderDate: new Date().toISOString(), status: 'CONFIRMED', totalAmount: 199.98, shippingAddress: 'Plot 88, Jubilee Hills Road 36, Hyderabad', orderItems: [{ productId: 6, quantity: 2, unitPrice: 99.99 }] },
      { id: 6, orderNumber: 'ORD-2026-105', customer: { id: 7, name: 'Arjun Kapoor', email: 'arjun.kapoor@gmail.com', phone: '+91-9811443322', address: '12, Golf Links Road', city: 'New Delhi', state: 'Delhi', pincode: '110003' }, orderDate: new Date().toISOString(), status: 'PENDING', totalAmount: 449.00, shippingAddress: '12, Golf Links Road, New Delhi', orderItems: [{ productId: 10, quantity: 1, unitPrice: 449.00 }] }
    ];

    this.suppliers = [
      { id: 2, name: 'Apex Electronics Components Ltd', contactPerson: 'Amit Verma', email: 'sales@apextech.com', phone: '+91-9811223344', address: 'Sector 62, Electronic City', city: 'Gurgaon', state: 'Haryana', status: 'ACTIVE' },
      { id: 3, name: 'Nexus Global Hardware Supplies', contactPerson: 'Sunita Deshmukh', email: 'orders@nexusglobal.com', phone: '+91-9820112233', address: 'Andheri MIDC, Cross Road 5', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
      { id: 4, name: 'Zenith Consumer Goods Corp', contactPerson: 'Karan Johar', email: 'contact@zenithgoods.in', phone: '+91-9844001122', address: 'Whitefield Main Road', city: 'Bengaluru', state: 'Karnataka', status: 'ACTIVE' }
    ];

    this.purchaseOrders = [
      { id: 2, purchaseOrderNumber: 'PO-2026-001', supplier: this.suppliers[0], orderDate: new Date().toISOString(), status: 'RECEIVED', totalAmount: 8360.00, purchaseOrderItems: [] },
      { id: 3, purchaseOrderNumber: 'PO-2026-002', supplier: this.suppliers[1], orderDate: new Date().toISOString(), status: 'ORDERED', totalAmount: 4650.00, purchaseOrderItems: [] },
      { id: 4, purchaseOrderNumber: 'PO-2026-003', supplier: this.suppliers[2], orderDate: new Date().toISOString(), status: 'APPROVED', totalAmount: 2350.00, purchaseOrderItems: [] },
      { id: 5, purchaseOrderNumber: 'PO-2026-004', supplier: this.suppliers[0], orderDate: new Date().toISOString(), status: 'PENDING', totalAmount: 1560.00, purchaseOrderItems: [] }
    ];

    this.usersList = [
      { id: 1, name: 'Ajit Kumar', email: 'ajit@hcl.com', role: 'ADMIN', enabled: true },
      { id: 2, name: 'Akash', email: 'akash@hcl.com', role: 'ADMIN', enabled: true }
    ];
  }

  calculateMetrics() {
    this.totalRevenue = this.orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    this.totalStockUnits = this.inventoryList.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    this.reservedStockUnits = this.inventoryList.reduce((sum, i) => sum + (Number(i.reservedQuantity) || 0), 0);

    const pendingCount = this.pendingOrderCount;
    this.fulfillmentRate = this.orders.length
      ? Math.round(((this.orders.length - pendingCount) / this.orders.length) * 100)
      : 100;

    // Order status map
    const statusMap: Record<string, number> = {};
    this.orders.forEach(o => {
      const st = o.status || 'OTHER';
      statusMap[st] = (statusMap[st] || 0) + 1;
    });
    this.orderStatusDistribution = statusMap;

    // Stock health & low stock items
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStock: any[] = [];

    this.inventoryList.forEach(inv => {
      const avail = (Number(inv.quantity) || 0) - (Number(inv.reservedQuantity) || 0);
      const reorder = inv.reorderLevel || 10;
      if (avail <= 0) {
        outOfStockCount++;
        lowStock.push(inv);
      } else if (avail <= reorder) {
        lowStockCount++;
        lowStock.push(inv);
      } else {
        inStockCount++;
      }
    });

    this.lowStockItems = lowStock;
    this.outOfStockCount = outOfStockCount;
    this.stockHealth = {
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount
    };

    const totalStockTracked = inStockCount + lowStockCount + outOfStockCount || 1;
    this.inStockPct = Math.round((inStockCount / totalStockTracked) * 100);
    this.lowStockPct = Math.round((lowStockCount / totalStockTracked) * 100);
    this.outStockPct = Math.max(0, 100 - this.inStockPct - this.lowStockPct);

    this.recentOrders = [...this.orders].slice(-6).reverse();
  }

  getOrderStatusPct(key: string): number {
    const c = this.orderStatusDistribution[key] || 0;
    return this.orders.length ? (c / this.orders.length) * 100 : 0;
  }

  getOrderStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'CONFIRMED':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'PROCESSING':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
      case 'SHIPPED':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  }

  getProductName(inv: any): string {
    if (inv.product?.name) return inv.product.name;
    const p = this.products.find(x => x.id === inv.productId);
    return p ? p.name : `Product #${inv.productId || inv.id}`;
  }

  getProductSku(inv: any): string {
    if (inv.product?.sku) return inv.product.sku;
    const p = this.products.find(x => x.id === inv.productId);
    return p ? p.sku : 'N/A';
  }

  getWarehouseName(inv: any): string {
    if (inv.warehouse?.name) return inv.warehouse.name;
    const w = this.warehouses.find(x => x.id === (inv.warehouseId || inv.warehouse?.id));
    return w ? w.name : 'Warehouse';
  }

  getAvailableQuantity(inv: any): number {
    return (Number(inv.quantity) || 0) - (Number(inv.reservedQuantity) || 0);
  }
}
