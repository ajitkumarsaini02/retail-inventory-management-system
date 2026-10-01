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
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Customer Sales Orders</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6C3BFF]/10 text-[#6C3BFF] border border-[#6C3BFF]/20">
              {{ filteredOrders.length }} Invoices
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Live order fulfillment stream, invoicing, stage progression, and customer deliveries</p>
        </div>

        <button
          (click)="router.navigate(['/orders/add'])"
          class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <app-icon name="plus" className="w-4 h-4"></app-icon>
          <span>Create New Order</span>
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by order #, customer name, or address..."
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
          />
        </div>

        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING (Amber)</option>
          <option value="CONFIRMED">CONFIRMED (Blue)</option>
          <option value="PROCESSING">PROCESSING (Purple)</option>
          <option value="SHIPPED">SHIPPED (Cyan)</option>
          <option value="DELIVERED">DELIVERED (Green)</option>
          <option value="CANCELLED">CANCELLED (Red)</option>
        </select>
      </div>

      <!-- Orders Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4 font-mono">Order Number</th>
                <th class="py-3.5 px-4">Customer</th>
                <th class="py-3.5 px-4 text-right">Total Amount</th>
                <th class="py-3.5 px-4">Order Date</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr><td colSpan="6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading customer orders...</td></tr>
              } @else if (filteredOrders.length === 0) {
                <tr><td colSpan="6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No customer orders found.</td></tr>
              } @else {
                @for (ord of filteredOrders; track ord.id) {
                  <tr
                    (click)="router.navigate(['/orders', ord.id])"
                    class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition cursor-pointer"
                  >
                    <!-- Order Number -->
                    <td class="py-3.5 px-4 font-mono font-bold text-[#6C3BFF] dark:text-[#A78BFA] whitespace-nowrap">
                      {{ ord.orderNumber }}
                    </td>

                    <!-- Customer -->
                    <td class="py-3.5 px-4">
                      <div class="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {{ ord.customer?.name || 'Walk-in Customer' }}
                      </div>
                      <div class="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {{ ord.customer?.email || 'N/A' }}
                      </div>
                    </td>

                    <!-- Total Amount -->
                    <td class="py-3.5 px-4 text-right font-mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
                      \${{ (ord.totalAmount || 0) | number:'1.2-2' }}
                    </td>

                    <!-- Order Date -->
                    <td class="py-3.5 px-4 text-[#475569] dark:text-[#94A3B8] whitespace-nowrap">
                      {{ (ord.orderDate || ord.createdAt) | date:'mediumDate' }}
                    </td>

                    <!-- Status with Exact Colors -->
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="getStatusBadgeClass(ord.status)"
                      >
                        {{ ord.status }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        (click)="$event.stopPropagation(); router.navigate(['/orders', ord.id])"
                        class="px-3 py-1 text-xs font-semibold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <app-icon name="eye" className="w-3.5 h-3.5"></app-icon>
                        <span>View</span>
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

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-500 border border-amber-500/25';
      case 'CONFIRMED':
        return 'bg-blue-500/15 text-blue-500 border border-blue-500/25';
      case 'PROCESSING':
        return 'bg-purple-500/15 text-[#6C3BFF] dark:text-[#A78BFA] border border-[#6C3BFF]/25';
      case 'SHIPPED':
        return 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/25';
      case 'DELIVERED':
        return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25';
      case 'CANCELLED':
        return 'bg-red-500/15 text-red-500 border border-red-500/25';
      default:
        return 'bg-slate-500/15 text-slate-500 border border-slate-500/25';
    }
  }
}
