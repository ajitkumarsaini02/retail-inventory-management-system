import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Customer Sales Orders</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Live order fulfillment stream, invoicing, and stage management</p>
        </div>

        <button
          (click)="router.navigate(['/orders/add'])"
          class="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <app-icon name="plus" className="w-4 h-4"></app-icon>
          <span>Create New Order</span>
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by order # or customer name..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <!-- Orders Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4">Order #</th>
                <th class="py-3.5 px-4">Customer</th>
                <th class="py-3.5 px-4">Date</th>
                <th class="py-3.5 px-4 text-right">Amount</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @if (isLoading) {
                <tr><td colSpan="6" class="py-12 text-center text-slate-400">Loading customer orders...</td></tr>
              } @else if (filteredOrders.length === 0) {
                <tr><td colSpan="6" class="py-12 text-center text-slate-400">No customer orders found.</td></tr>
              } @else {
                @for (ord of filteredOrders; track ord.id) {
                  <tr
                    (click)="router.navigate(['/orders', ord.id])"
                    class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ ord.orderNumber }}</td>
                    <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{{ ord.customer?.name || 'Walk-in Customer' }}</td>
                    <td class="py-3.5 px-4 text-slate-400 text-xs">{{ (ord.orderDate || ord.createdAt) | date:'mediumDate' }}</td>
                    <td class="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      \${{ (ord.totalAmount || 0) | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : (ord.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300')"
                      >
                        {{ ord.status }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <button
                        (click)="$event.stopPropagation(); router.navigate(['/orders', ord.id])"
                        class="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                      >
                        <app-icon name="eye" className="w-4 h-4"></app-icon>
                      </button>
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
export class OrderListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  isLoading = true;
  searchQuery = '';
  selectedStatus = 'ALL';

  get filteredOrders(): Order[] {
    return this.orders.filter(o => {
      const matchSt = this.selectedStatus === 'ALL' || o.status === this.selectedStatus;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchSt;
      const num = (o.orderNumber || '').toLowerCase();
      const cust = (o.customer?.name || '').toLowerCase();
      return matchSt && (num.includes(q) || cust.includes(q));
    });
  }

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
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
