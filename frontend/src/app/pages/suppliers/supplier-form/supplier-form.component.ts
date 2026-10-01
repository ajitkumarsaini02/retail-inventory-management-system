import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { Supplier, SupplierStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            (click)="router.navigate(['/suppliers'])"
            class="p-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
          >
            <app-icon name="arrow-left" className="w-5 h-5"></app-icon>
          </button>
          <div>
            <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {{ isEditMode ? 'Edit Supplier Profile' : 'Onboard New Supplier' }}
            </h1>
            <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
              {{ isEditMode ? 'Update vendor credentials, contacts, and terms' : 'Register a certified vendor partner into your procurement supply chain' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Error Banner -->
      @if (errorMessage) {
        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <app-icon name="alert-triangle" className="w-4 h-4 shrink-0"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>
          <button (click)="errorMessage = ''" class="text-red-400 hover:text-red-600 cursor-pointer">
            <app-icon name="x" className="w-4 h-4"></app-icon>
          </button>
        </div>
      }

      <!-- Form Card -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-6 sm:p-8 shadow-xs">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Company Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Company / Vendor Legal Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                [(ngModel)]="formData.name"
                placeholder="e.g. Apex Tech Logistics Ltd."
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Contact Person -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Primary Contact Person <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                required
                [(ngModel)]="formData.contactPerson"
                placeholder="e.g. Amit Sharma"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Work Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                [(ngModel)]="formData.email"
                placeholder="vendor@company.com"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Contact Phone <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                required
                [(ngModel)]="formData.phone"
                placeholder="+91-9876543210"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Vendor Status
              </label>
              <select
                name="status"
                [(ngModel)]="formData.status"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <!-- Street Address -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Street Address <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                [(ngModel)]="formData.address"
                placeholder="Plot 45, Phase 2, Industrial Hub"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- City -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                City <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                [(ngModel)]="formData.city"
                placeholder="Gurgaon"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- State -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                State <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                required
                [(ngModel)]="formData.state"
                placeholder="Haryana"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Pincode -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Postal / Pincode <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                required
                [(ngModel)]="formData.pincode"
                placeholder="122001"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Country -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                [(ngModel)]="formData.country"
                placeholder="India"
                class="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-[#E2E8F0] dark:border-[#252C45]">
            <button
              type="button"
              (click)="router.navigate(['/suppliers'])"
              class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting"
              class="px-6 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <app-icon [name]="isEditMode ? 'check' : 'plus'" className="w-4 h-4"></app-icon>
              <span>{{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Supplier' : 'Register Supplier' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SupplierFormComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private supplierService = inject(SupplierService);

  isEditMode = false;
  supplierId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  formData = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    status: 'ACTIVE' as SupplierStatus
  };

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.supplierId = Number(idParam);
      this.loadSupplier(this.supplierId);
    }
  }

  private loadSupplier(id: number) {
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.formData = {
          name: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          pincode: supplier.pincode || '',
          country: supplier.country || 'India',
          status: supplier.status || 'ACTIVE'
        };
      },
      error: (err) => {
        this.errorMessage = 'Failed to load supplier details: ' + (err.error?.message || err.message);
      }
    });
  }

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.phone || !this.formData.address || !this.formData.city || !this.formData.state || !this.formData.pincode) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: Partial<Supplier> = {
      ...this.formData
    };

    if (this.isEditMode && this.supplierId) {
      this.supplierService.updateSupplier(this.supplierId, payload).subscribe({
        next: () => {
          this.router.navigate(['/suppliers']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to update supplier: ' + (err.error?.message || err.message);
        }
      });
    } else {
      this.supplierService.createSupplier(payload).subscribe({
        next: () => {
          this.router.navigate(['/suppliers']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create supplier: ' + (err.error?.message || err.message);
        }
      });
    }
  }
}
