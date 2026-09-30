import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../../services/warehouse.service';
import { Warehouse, WarehouseStatus } from '../../../models';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
            {{ isEdit ? 'Edit Warehouse Hub' : 'Add New Warehouse Hub' }}
          </h1>
          <p class="text-xs text-slate-400 mt-0.5">Facility details, storage capacity, and dispatch coordinates</p>
        </div>
        <button
          (click)="router.navigate(['/warehouses'])"
          class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="saveWarehouse()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Warehouse Name *</label>
            <input
              type="text"
              [(ngModel)]="warehouse.name"
              name="name"
              required
              placeholder="e.g. Central Distribution Hub A"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Address *</label>
            <input
              type="text"
              [(ngModel)]="warehouse.address"
              name="address"
              required
              placeholder="e.g. Sector 62, Industrial Area, Noida"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Capacity (Max Units) *</label>
              <input
                type="number"
                [(ngModel)]="warehouse.capacity"
                name="capacity"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Contact Phone</label>
              <input
                type="text"
                [(ngModel)]="warehouse.contactNumber"
                name="contactNumber"
                placeholder="+91-9876543210"
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Operational Status</label>
            <select
              [(ngModel)]="warehouse.status"
              name="status"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/warehouses'])"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {{ isSaving ? 'Saving...' : (isEdit ? 'Update Facility' : 'Register Facility') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class WarehouseFormComponent implements OnInit {
  private warehouseService = inject(WarehouseService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  isEdit = false;
  warehouseId?: number;
  isSaving = false;
  errorMessage = '';

  warehouse: Partial<Warehouse> = {
    name: '',
    address: '',
    capacity: 10000,
    contactNumber: '',
    status: 'ACTIVE'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.warehouseId = Number(id);
      this.warehouseService.getWarehouseById(this.warehouseId).subscribe({
        next: (wh) => { this.warehouse = wh; },
        error: () => { this.router.navigate(['/warehouses']); }
      });
    }
  }

  saveWarehouse() {
    this.isSaving = true;
    this.errorMessage = '';

    const req$ = this.isEdit && this.warehouseId
      ? this.warehouseService.updateWarehouse(this.warehouseId, this.warehouse)
      : this.warehouseService.createWarehouse(this.warehouse);

    req$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/warehouses']);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save facility details.';
      }
    });
  }
}
