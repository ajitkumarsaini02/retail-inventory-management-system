import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../../services/warehouse.service';
import { Warehouse, WarehouseStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {{ isEdit ? 'Edit Warehouse Hub' : 'Add New Warehouse Hub' }}
          </h1>
          <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Facility details, storage capacity, city logistics, and contact coordinates</p>
        </div>
        <button
          (click)="router.navigate(['/warehouses'])"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
        >
          <app-icon name="arrow-left" className="w-3.5 h-3.5"></app-icon>
          <span>Cancel</span>
        </button>
      </div>

      <div class="bg-white dark:bg-[#141A2E] rounded-3xl border border-[#E2E8F0] dark:border-[#252C45] p-6 sm:p-8 shadow-xs">
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="saveWarehouse()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Warehouse Name *</label>
              <input
                type="text"
                [(ngModel)]="warehouse.name"
                name="name"
                required
                placeholder="e.g. Delhi Northern Distribution Hub"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Warehouse Code</label>
              <input
                type="text"
                [(ngModel)]="warehouse.code"
                name="code"
                placeholder="e.g. WH-DEL-01"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm font-mono text-[#6C3BFF] dark:text-[#A78BFA] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">City / Region</label>
              <input
                type="text"
                [(ngModel)]="warehouse.city"
                name="city"
                placeholder="e.g. New Delhi, NCR"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Capacity (Max Units) *</label>
              <input
                type="number"
                [(ngModel)]="warehouse.capacity"
                name="capacity"
                required
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Address *</label>
            <input
              type="text"
              [(ngModel)]="warehouse.address"
              name="address"
              required
              placeholder="e.g. Khasra 45, NH-8, Kapashera, New Delhi"
              class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Contact Phone</label>
              <input
                type="text"
                [(ngModel)]="warehouse.contactNumber"
                name="contactNumber"
                placeholder="+91-9876543210"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Operational Status</label>
              <select
                [(ngModel)]="warehouse.status"
                name="status"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/warehouses'])"
              class="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="px-5 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isSaving) {
                <app-icon name="refresh" className="w-4 h-4 animate-spin"></app-icon>
                <span>Saving...</span>
              } @else {
                <app-icon name="check" className="w-4 h-4"></app-icon>
                <span>{{ isEdit ? 'Update Hub' : 'Register Hub' }}</span>
              }
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
    code: '',
    city: '',
    address: '',
    capacity: 50000,
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
