import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { Customer } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Customer Directory</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Manage retail store clients, shipping addresses, and contact info</p>
        </div>

        <button
          (click)="router.navigate(['/customers/add'])"
          class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <app-icon name="plus" className="w-4 h-4"></app-icon>
          <span>Register New Customer</span>
        </button>
      </div>

      <!-- Search -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div class="relative">
          <app-icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by customer name, email, or city..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4">Customer</th>
                <th class="py-3.5 px-4">Phone</th>
                <th class="py-3.5 px-4">City / State</th>
                <th class="py-3.5 px-4">Address</th>
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @if (isLoading) {
                <tr><td [colSpan]="authService.isAdmin() ? 5 : 4" class="py-12 text-center text-slate-400">Loading customer records...</td></tr>
              } @else if (filteredCustomers.length === 0) {
                <tr><td [colSpan]="authService.isAdmin() ? 5 : 4" class="py-12 text-center text-slate-400">No customers found.</td></tr>
              } @else {
                @for (cust of filteredCustomers; track cust.id) {
                  <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {{ cust.name.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-bold text-slate-900 dark:text-white">{{ cust.name }}</div>
                          <div class="text-[11px] text-slate-400">{{ cust.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{{ cust.phone }}</td>
                    <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300">{{ cust.city }}, {{ cust.state }}</td>
                    <td class="py-3.5 px-4 text-slate-500 max-w-xs truncate">{{ cust.address }}</td>
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 text-right">
                        <button
                          (click)="router.navigate(['/customers/edit', cust.id])"
                          class="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
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
  private cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];
  isLoading = true;
  searchQuery = '';

  get filteredCustomers(): Customer[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.customers;
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
    );
  }

  ngOnInit() {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data || [];
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
