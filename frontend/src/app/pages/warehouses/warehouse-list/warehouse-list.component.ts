import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { WarehouseService } from '../../../services/warehouse.service';
import { InventoryService } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';
import { Warehouse, Inventory } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_WAREHOUSES, INITIAL_INVENTORIES } from '../../../constants/initial-data';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Distribution Hubs</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
              {{ warehouses.length }} Hubs Operational
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Multi-facility warehouse network, storage capacities, inventory occupancy, and routing</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/warehouses/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Add Warehouse</span>
          </button>
        }
      </div>

      <!-- Warehouse Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @if (isLoading) {
          <div class="col-span-full py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading distribution facilities...</div>
        } @else if (warehouses.length === 0) {
          <div class="col-span-full py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No warehouse facilities registered.</div>
        } @else {
          @for (wh of warehouses; track wh.id) {
            @let stock = getWarehouseStock(wh.id);
            @let utilPct = wh.capacity > 0 ? mathRound((stock / wh.capacity) * 100) : 0;

            <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-5 shadow-xs hover:border-[#38BDF8]/50 transition-colors card-hover-elevate flex flex-col justify-between">
              <div>
                <!-- Top Row: Icon + Code + Name + Status -->
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                      <app-icon name="warehouse" className="w-5 h-5"></app-icon>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[11px] font-bold text-[#6C3BFF] dark:text-[#A78BFA] px-1.5 py-0.5 rounded bg-[#6C3BFF]/10">
                          {{ wh.code || ('WH-00' + wh.id) }}
                        </span>
                        <span class="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                          {{ wh.city || 'Regional Center' }}
                        </span>
                      </div>
                      <h3 class="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">{{ wh.name }}</h3>
                    </div>
                  </div>

                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                    [ngClass]="wh.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/15 text-red-500 border border-red-500/20'"
                  >
                    {{ wh.status }}
                  </span>
                </div>

                <!-- Info Metrics -->
                <div class="mt-4 space-y-2.5 text-xs">
                  <!-- City / Address -->
                  <div class="text-[#475569] dark:text-[#94A3B8] flex items-start gap-2">
                    <span class="w-20 shrink-0 text-[#64748B] dark:text-[#94A3B8]">Location:</span>
                    <span class="text-[#0F172A] dark:text-[#F8FAFC] font-medium truncate">{{ wh.address }}</span>
                  </div>

                  <!-- Capacity -->
                  <div class="text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                    <span class="text-[#64748B] dark:text-[#94A3B8]">Total Capacity:</span>
                    <span class="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ (wh.capacity || 0).toLocaleString() }} units</span>
                  </div>

                  <!-- Current Stock -->
                  <div class="text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                    <span class="text-[#64748B] dark:text-[#94A3B8]">Current Stock:</span>
                    <span class="font-mono font-extrabold text-[#38BDF8]">{{ stock.toLocaleString() }} units</span>
                  </div>

                  <!-- Utilization Bar -->
                  <div class="pt-1">
                    <div class="flex items-center justify-between text-[11px] mb-1">
                      <span class="text-[#64748B] dark:text-[#94A3B8]">Capacity Utilization</span>
                      <span class="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ utilPct }}%</span>
                    </div>
                    <div class="w-full bg-[#E2E8F0] dark:bg-[#11172B] rounded-full h-1.5 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-[#38BDF8] to-[#6C3BFF] h-1.5 rounded-full"
                        [style.width.%]="utilPct > 100 ? 100 : utilPct"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Bar -->
              @if (authService.isAdmin()) {
                <div class="mt-5 pt-3 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end">
                  <button
                    (click)="router.navigate(['/warehouses/edit', wh.id])"
                    class="px-3 py-1.5 text-xs font-semibold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition cursor-pointer"
                  >
                    Edit Hub
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class WarehouseListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private warehouseService = inject(WarehouseService);
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);

  warehouses: Warehouse[] = [...INITIAL_WAREHOUSES];
  inventoryList: Inventory[] = [...INITIAL_INVENTORIES];
  isLoading = false;
  mathRound = Math.round;

  ngOnInit() {
    if (this.warehouses.length === 0) {
      this.isLoading = true;
    }
    forkJoin({
      whs: this.warehouseService.getAllWarehouses().pipe(catchError(() => of([]))),
      invs: this.inventoryService.getAllInventory().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.warehouses = res.whs || [];
        this.inventoryList = res.invs || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getWarehouseStock(warehouseId: number): number {
    return this.inventoryList
      .filter(i => (i.warehouse?.id || i.warehouseId) === warehouseId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }
}
