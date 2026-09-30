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

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inventory & Stock Tracking</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Multi-warehouse stock allocations, reserved volumes, and threshold monitoring</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/purchase-orders/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <app-icon name="file-spreadsheet" className="w-4 h-4"></app-icon>
            <span>Replenish Stock (New PO)</span>
          </button>
        }
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span class="text-slate-400 text-xs font-bold uppercase">Total Units Tracked</span>
          <p class="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{{ totalUnits.toLocaleString() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span class="text-slate-400 text-xs font-bold uppercase">Reserved for Orders</span>
          <p class="text-xl font-extrabold text-violet-600 font-mono mt-1">{{ reservedUnits.toLocaleString() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span class="text-slate-400 text-xs font-bold uppercase">Net Available</span>
          <p class="text-xl font-extrabold text-emerald-600 font-mono mt-1">{{ (totalUnits - reservedUnits).toLocaleString() }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span class="text-slate-400 text-xs font-bold uppercase">Low Stock Alerts</span>
          <p class="text-xl font-extrabold text-amber-600 font-mono mt-1">{{ lowStockCount }}</p>
        </div>
      </div>

      <!-- Search & Warehouse Filter -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by product name or SKU..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <select
          [(ngModel)]="selectedWarehouseId"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option [value]="0">All Warehouses</option>
          @for (wh of warehouses; track wh.id) {
            <option [value]="wh.id">{{ wh.name }}</option>
          }
        </select>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4">Product</th>
                <th class="py-3.5 px-4">Warehouse Facility</th>
                <th class="py-3.5 px-4 text-right">On Hand</th>
                <th class="py-3.5 px-4 text-right">Reserved</th>
                <th class="py-3.5 px-4 text-right">Available</th>
                <th class="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @if (isLoading) {
                <tr><td colSpan="6" class="py-12 text-center text-slate-400">Loading stock records...</td></tr>
              } @else if (filteredInventory.length === 0) {
                <tr><td colSpan="6" class="py-12 text-center text-slate-400">No inventory entries found.</td></tr>
              } @else {
                @for (inv of filteredInventory; track inv.id) {
                  @let avail = (inv.quantity || 0) - (inv.reservedQuantity || 0);
                  <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900 dark:text-white">{{ inv.product?.name || 'Product #' + inv.productId }}</div>
                      <div class="text-[11px] text-slate-400 font-mono">SKU: {{ inv.product?.sku || 'N/A' }}</div>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {{ inv.warehouse?.name || 'Hub #' + inv.warehouseId }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {{ inv.quantity }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono text-violet-600">
                      {{ inv.reservedQuantity }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold" [ngClass]="avail <= 0 ? 'text-rose-600' : (avail <= (inv.reorderLevel || 10) ? 'text-amber-600' : 'text-emerald-600')">
                      {{ avail }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="avail <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : (avail <= (inv.reorderLevel || 10) ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300')"
                      >
                        {{ avail <= 0 ? 'OUT OF STOCK' : (avail <= (inv.reorderLevel || 10) ? 'LOW STOCK' : 'IN STOCK') }}
                      </span>
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

  inventoryList: Inventory[] = [];
  warehouses: Warehouse[] = [];
  isLoading = true;
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
      return avail <= (i.reorderLevel || 10);
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
