import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (order) {
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#252C45]">
          <div class="flex items-center gap-3">
            <button
              (click)="router.navigate(['/orders'])"
              class="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] text-[#475569] dark:text-[#94A3B8] cursor-pointer transition"
            >
              <app-icon name="arrow-right" className="w-4 h-4 rotate-180"></app-icon>
            </button>
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono">{{ order.orderNumber }}</h1>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  [ngClass]="getStatusBadgeClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Placed on {{ (order.orderDate || order.createdAt) | date:'medium' }}</p>
            </div>
          </div>

          <!-- Status Transition Actions -->
          <div class="flex items-center gap-2">
            @if (order.status === 'PENDING') {
              <button
                (click)="updateStatus('CONFIRMED')"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm Order
              </button>
            } @else if (order.status === 'CONFIRMED') {
              <button
                (click)="updateStatus('PROCESSING')"
                class="px-4 py-2 bg-[#6C3BFF] hover:bg-[#7C4DFF] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Start Processing
              </button>
            } @else if (order.status === 'PROCESSING') {
              <button
                (click)="updateStatus('SHIPPED')"
                class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Ship Package
              </button>
            } @else if (order.status === 'SHIPPED') {
              <button
                (click)="updateStatus('DELIVERED')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Mark Delivered
              </button>
            }
            @if (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
              <button
                (click)="updateStatus('CANCELLED')"
                class="px-3.5 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            }
          </div>
        </div>

        <!-- Customer & Shipping Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-5 shadow-xs">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block mb-2">Customer Details</span>
            <div class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ order.customer?.name || 'Walk-in Customer' }}</div>
            <div class="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">{{ order.customer?.email }}</div>
            <div class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">{{ order.customer?.phone }}</div>
          </div>

          <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-5 shadow-xs">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block mb-2">Shipping Destination</span>
            <div class="text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">{{ order.shippingAddress || 'Store Pickup' }}</div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
          <div class="p-4 border-b border-[#E2E8F0] dark:border-[#252C45]">
            <h3 class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Order Line Items</h3>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
                <tr>
                  <th class="py-3 px-4">Item SKU</th>
                  <th class="py-3 px-4 text-center">Quantity</th>
                  <th class="py-3 px-4 text-right">Unit Price</th>
                  <th class="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
                @for (item of order.orderItems; track item.id) {
                  <tr>
                    <td class="py-3 px-4">
                      <div class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ item.product?.name || 'Product #' + item.productId }}</div>
                      <div class="text-[11px] text-[#6C3BFF] dark:text-[#A78BFA] font-mono">SKU: {{ item.product?.sku || 'N/A' }}</div>
                    </td>
                    <td class="py-3 px-4 text-center font-mono font-bold">{{ item.quantity }}</td>
                    <td class="py-3 px-4 text-right font-mono text-[#475569] dark:text-[#94A3B8]">\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-5 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end">
            <div class="text-right">
              <span class="text-xs text-[#475569] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Gross Total</span>
              <p class="text-2xl font-extrabold text-[#6C3BFF] dark:text-[#A78BFA] font-mono mt-0.5">
                \${{ order.totalAmount | number:'1.2-2' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  order?: Order;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(Number(id));
    }
  }

  loadOrder(id: number) {
    this.orderService.getOrderById(id).subscribe({
      next: (ord) => {
        this.order = ord;
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

  updateStatus(newStatus: OrderStatus) {
    if (!this.order) return;
    this.orderService.updateOrder(this.order.id, { ...this.order, status: newStatus }).subscribe({
      next: (updated) => {
        this.order = updated;
        this.cdr.markForCheck();
      }
    });
  }
}
