import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InventoryService } from '../../../services/inventory.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { AuthService } from '../../../services/auth.service';
import { Inventory, Warehouse } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_INVENTORIES, INITIAL_WAREHOUSES } from '../../../constants/initial-data';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Inventory & Stock Tracking</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
              Live Telemetry
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Multi-warehouse stock allocations, reserved volumes, safety thresholds, and replenishment alerts</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/purchase-orders/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Replenish Stock (New PO)</span>
          </button>
        }
      </div>

      <!-- Inventory Overview KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- Total Stock -->
        <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[#475569] dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Total Stock</span>
            <div class="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
              <app-icon name="layers" className="w-4 h-4"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono mt-2">{{ totalUnits.toLocaleString() }}</p>
          <span class="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Gross units stored</span>
        </div>

        <!-- Reserved Stock -->
        <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[#475569] dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Reserved Stock</span>
            <div class="w-8 h-8 rounded-lg bg-[#6C3BFF]/10 text-[#6C3BFF] flex items-center justify-center">
              <app-icon name="clock" className="w-4 h-4"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#6C3BFF] font-mono mt-2">{{ reservedUnits.toLocaleString() }}</p>
          <span class="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Committed to open orders</span>
        </div>

        <!-- Available Stock -->
        <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[#475569] dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Available Stock</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <app-icon name="check-circle" className="w-4 h-4"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-emerald-500 font-mono mt-2">{{ (totalUnits - reservedUnits).toLocaleString() }}</p>
          <span class="text-[11px] text-emerald-500 font-semibold">Immediate fulfillment</span>
        </div>

        <!-- Reorder Alerts -->
        <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[#475569] dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Reorder Alerts</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <app-icon name="alert-triangle" className="w-4 h-4"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-amber-500 font-mono mt-2">{{ lowStockCount }}</p>
          <span class="text-[11px] text-amber-500 font-semibold">Below safety threshold</span>
        </div>
      </div>

      <!-- Search & Warehouse Filter -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by product name or SKU..."
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
          />
        </div>

        <select
          [(ngModel)]="selectedWarehouseId"
          class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
        >
          <option [value]="0">All Warehouses</option>
          @for (wh of warehouses; track wh.id) {
            <option [value]="wh.id">{{ wh.name }}</option>
          }
        </select>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4">Product</th>
                <th class="py-3.5 px-4 font-mono">SKU</th>
                <th class="py-3.5 px-4">Warehouse</th>
                <th class="py-3.5 px-4 text-right">Quantity</th>
                <th class="py-3.5 px-4 text-right">Reserved</th>
                <th class="py-3.5 px-4 text-right">Available</th>
                <th class="py-3.5 px-4 text-center">Reorder Level</th>
                <th class="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr><td colSpan="8" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading stock records...</td></tr>
              } @else if (filteredInventory.length === 0) {
                <tr><td colSpan="8" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No inventory entries found.</td></tr>
              } @else {
                @for (inv of filteredInventory; track inv.id) {
                  @let avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
                  @let threshold = inv.reorderLevel || inv.product?.reorderLevel || 10;
                  @let isCritical = avail <= 0;
                  @let isLow = avail > 0 && avail <= threshold;

                  <tr
                    class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition"
                    [ngClass]="{
                      'bg-red-500/[0.03] dark:bg-red-500/[0.04]': isCritical,
                      'bg-amber-500/[0.03] dark:bg-amber-500/[0.04]': isLow
                    }"
                  >
                    <!-- Product -->
                    <td class="py-3.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {{ inv.product?.name || 'Product #' + inv.productId }}
                    </td>

                    <!-- SKU -->
                    <td class="py-3.5 px-4 font-mono font-bold text-[#6C3BFF] dark:text-[#A78BFA] whitespace-nowrap">
                      {{ inv.product?.sku || ('SKU-' + inv.productId) }}
                    </td>

                    <!-- Warehouse -->
                    <td class="py-3.5 px-4 font-medium text-[#475569] dark:text-[#94A3B8] whitespace-nowrap">
                      {{ inv.warehouse?.name || 'Hub #' + inv.warehouseId }}
                    </td>

                    <!-- Quantity -->
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {{ inv.quantity }}
                    </td>

                    <!-- Reserved -->
                    <td class="py-3.5 px-4 text-right font-mono text-[#6C3BFF] font-semibold">
                      {{ inv.reservedQuantity }}
                    </td>

                    <!-- Available -->
                    <td class="py-3.5 px-4 text-right font-mono font-extrabold" [ngClass]="isCritical ? 'text-red-500' : (isLow ? 'text-amber-500' : 'text-emerald-500')">
                      {{ avail }}
                    </td>

                    <!-- Reorder Level -->
                    <td class="py-3.5 px-4 text-center font-mono text-[#475569] dark:text-[#94A3B8]">
                      {{ threshold }}
                    </td>

                    <!-- Status with amber/red alerts -->
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      @if (isCritical) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-500 border border-red-500/25">
                          <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          OUT OF STOCK
                        </span>
                      } @else if (isLow) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          LOW STOCK
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                          OPTIMAL
                        </span>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private inventoryService = inject(InventoryService);
  private warehouseService = inject(WarehouseService);
  private cdr = inject(ChangeDetectorRef);

  inventoryList: Inventory[] = [...INITIAL_INVENTORIES];
  warehouses: Warehouse[] = [...INITIAL_WAREHOUSES];
  isLoading = false;
  searchQuery = '';
  selectedWarehouseId = 0;

  get totalUnits(): number {
    return this.inventoryList.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }

  get reservedUnits(): number {
    return this.inventoryList.reduce((sum, i) => sum + (Number(i.reservedQuantity) || 0), 0);
  }

  get lowStockCount(): number {
    return this.inventoryList.filter(i => {
      const avail = (Number(i.quantity) || 0) - (Number(i.reservedQuantity) || 0);
      const threshold = i.reorderLevel || i.product?.reorderLevel || 10;
      return avail <= threshold;
    }).length;
  }

  get filteredInventory(): Inventory[] {
    return this.inventoryList.filter(i => {
      const matchWh = this.selectedWarehouseId === 0 || (i.warehouse?.id || i.warehouseId) === Number(this.selectedWarehouseId);
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchWh;
      const prodName = (i.product?.name || '').toLowerCase();
      const sku = (i.product?.sku || '').toLowerCase();
      return matchWh && (prodName.includes(q) || sku.includes(q));
    });
  }

  ngOnInit() {
    if (this.inventoryList.length === 0) {
      this.isLoading = true;
    }
    forkJoin({
      invs: this.inventoryService.getAllInventory(),
      whs: this.warehouseService.getAllWarehouses()
    }).subscribe({
      next: (res) => {
        this.inventoryList = res.invs || [];
        this.warehouses = res.whs || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
