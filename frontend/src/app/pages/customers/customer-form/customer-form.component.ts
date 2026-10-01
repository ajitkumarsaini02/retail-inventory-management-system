import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {{ isEdit ? 'Edit Customer' : 'Register New Customer' }}
          </h1>
          <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Customer contact info and delivery coordinates</p>
        </div>
        <button
          (click)="router.navigate(['/customers'])"
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

        <form (ngSubmit)="saveCustomer()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Full Name *</label>
              <input
                type="text"
                [(ngModel)]="customer.name"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Email Address *</label>
              <input
                type="email"
                [(ngModel)]="customer.email"
                name="email"
                required
                placeholder="rahul@example.com"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Phone Number *</label>
              <input
                type="text"
                [(ngModel)]="customer.phone"
                name="phone"
                required
                placeholder="+91-9876543210"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Pincode *</label>
              <input
                type="text"
                [(ngModel)]="customer.pincode"
                name="pincode"
                required
                placeholder="201301"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">City *</label>
              <input
                type="text"
                [(ngModel)]="customer.city"
                name="city"
                required
                placeholder="Noida"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">State *</label>
              <input
                type="text"
                [(ngModel)]="customer.state"
                name="state"
                required
                placeholder="Uttar Pradesh"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Delivery Address *</label>
            <textarea
              [(ngModel)]="customer.address"
              name="address"
              rows="3"
              required
              placeholder="Flat 402, Sunshine Heights, Sector 45..."
              class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
            ></textarea>
          </div>

          <div class="pt-4 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/customers'])"
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
                <span>{{ isEdit ? 'Update Customer' : 'Save Customer' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerFormComponent implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  isEdit = false;
  customerId?: number;
  isSaving = false;
  errorMessage = '';

  customer: Partial<Customer> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.customerId = Number(id);
      this.customerService.getCustomerById(this.customerId).subscribe({
        next: (c) => { this.customer = c; },
        error: () => { this.router.navigate(['/customers']); }
      });
    }
  }

  saveCustomer() {
    this.isSaving = true;
    this.errorMessage = '';

    const req$ = this.isEdit && this.customerId
      ? this.customerService.updateCustomer(this.customerId, this.customer)
      : this.customerService.createCustomer(this.customer);

    req$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save customer.';
      }
    });
  }
}
