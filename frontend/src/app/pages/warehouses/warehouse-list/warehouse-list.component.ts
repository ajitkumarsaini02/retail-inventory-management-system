import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WarehouseService } from '../../../services/warehouse.service';
import { AuthService } from '../../../services/auth.service';
import { Warehouse } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Distribution Hubs</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Multi-facility warehouse network, capacities, and address routing</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/warehouses/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Add Warehouse Hub</span>
          </button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @if (isLoading) {
          <div class="col-span-full py-12 text-center text-slate-400">Loading distribution facilities...</div>
        } @else if (warehouses.length === 0) {
          <div class="col-span-full py-12 text-center text-slate-400">No warehouse facilities registered.</div>
        } @else {
          @for (wh of warehouses; track wh.id) {
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs card-hover-elevate flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
                      <app-icon name="warehouse" className="w-5 h-5"></app-icon>
                    </div>
                    <div>
                      <h3 class="font-bold text-sm text-slate-900 dark:text-white">{{ wh.name }}</h3>
                      <span class="text-[10px] text-slate-400 font-mono">Hub ID: #{{ wh.id }}</span>
                    </div>
                  </div>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="wh.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ wh.status }}
                  </span>
                </div>

                <div class="mt-4 space-y-2 text-xs">
                  <div class="text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span class="text-slate-400 text-[11px] w-14 shrink-0">Address:</span>
                    <span>{{ wh.address }}</span>
                  </div>
                  <div class="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span class="text-slate-400 text-[11px] w-14 shrink-0">Contact:</span>
                    <span>{{ wh.contactNumber || 'Operational Team' }}</span>
                  </div>
                  <div class="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span class="text-slate-400 text-[11px] w-14 shrink-0">Capacity:</span>
                    <span class="font-mono font-bold text-slate-800 dark:text-white">{{ (wh.capacity || 0).toLocaleString() }} units</span>
                  </div>
                </div>
              </div>

              @if (authService.isAdmin()) {
                <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    (click)="router.navigate(['/warehouses/edit', wh.id])"
                    class="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
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
  private cdr = inject(ChangeDetectorRef);

  warehouses: Warehouse[] = [];
  isLoading = true;

  ngOnInit() {
    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data || [];
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
