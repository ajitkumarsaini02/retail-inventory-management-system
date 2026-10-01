import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { CustomerService } from '../../../services/customer.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Customer, Order } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS } from '../../../constants/initial-data';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Customer Directory</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
              {{ filteredCustomers.length }} Verified Clients
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Manage retail store clients, shipping addresses, order histories, and contact info</p>
        </div>

        <button
          (click)="router.navigate(['/customers/add'])"
          class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <app-icon name="plus" className="w-4 h-4"></app-icon>
          <span>Register New Customer</span>
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs">
        <div class="relative">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by customer name, email, phone, or city..."
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
          />
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4">Customer Name</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Phone</th>
                <th class="py-3.5 px-4">Address</th>
                <th class="py-3.5 px-4 text-center">Total Orders</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading customer records...</td></tr>
              } @else if (filteredCustomers.length === 0) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No customers found matching criteria.</td></tr>
              } @else {
                @for (cust of filteredCustomers; track cust.id) {
                  @let orderCount = getCustomerOrderCount(cust.id);

                  <tr class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition">
                    <!-- Customer Name -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C3BFF]/20 to-[#2563EB]/20 text-[#6C3BFF] dark:text-[#A78BFA] font-bold text-xs flex items-center justify-center shrink-0 border border-[#6C3BFF]/20">
                          {{ cust.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ cust.name }}</div>
                      </div>
                    </td>

                    <!-- Email -->
                    <td class="py-3.5 px-4 text-[#475569] dark:text-[#94A3B8] font-mono text-xs">
                      {{ cust.email }}
                    </td>

                    <!-- Phone -->
                    <td class="py-3.5 px-4 font-mono text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
                      {{ cust.phone }}
                    </td>

                    <!-- Address -->
                    <td class="py-3.5 px-4 text-[#475569] dark:text-[#94A3B8] max-w-xs">
                      <div class="truncate">{{ cust.address }}</div>
                      <div class="text-[11px] text-[#64748B]">{{ cust.city }}, {{ cust.state }}</div>
                    </td>

                    <!-- Total Orders -->
                    <td class="py-3.5 px-4 text-center">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-400">
                        {{ orderCount }} {{ orderCount === 1 ? 'order' : 'orders' }}
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    </td>

                    <!-- Actions -->
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          (click)="router.navigate(['/customers/edit', cust.id])"
                          class="px-3 py-1 text-xs font-semibold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    }
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
export class CustomerListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [...INITIAL_CUSTOMERS];
  orders: Order[] = [...INITIAL_ORDERS];
  isLoading = false;
  searchQuery = '';

  get filteredCustomers(): Customer[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.customers;
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  }

  ngOnInit() {
    if (this.customers.length === 0) {
      this.isLoading = true;
    }
    forkJoin({
      custs: this.customerService.getAllCustomers().pipe(catchError(() => of([]))),
      ords: this.orderService.getAllOrders().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.customers = res.custs || [];
        this.orders = res.ords || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getCustomerOrderCount(customerId: number): number {
    return this.orders.filter(o => (o.customer?.id || o.customerId) === customerId).length;
  }
}
