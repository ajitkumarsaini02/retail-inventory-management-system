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
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <button
              (click)="router.navigate(['/orders'])"
              class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <app-icon name="arrow-right" className="w-4 h-4 rotate-180"></app-icon>
            </button>
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{{ order.orderNumber }}</h1>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  [ngClass]="order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : (order.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300')"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Placed on {{ (order.orderDate || order.createdAt) | date:'medium' }}</p>
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
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Start Processing
              </button>
            } @else if (order.status === 'PROCESSING') {
              <button
                (click)="updateStatus('SHIPPED')"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
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
                class="px-3.5 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            }
          </div>
        </div>

        <!-- Customer & Shipping Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Customer Details</span>
            <div class="text-sm font-bold text-slate-900 dark:text-white">{{ order.customer?.name || 'Walk-in Customer' }}</div>
            <div class="text-xs text-slate-500 mt-1">{{ order.customer?.email }}</div>
            <div class="text-xs text-slate-500 mt-0.5">{{ order.customer?.phone }}</div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Shipping Destination</span>
            <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{{ order.shippingAddress || 'Store Pickup' }}</div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Order Line Items</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Item SKU</th>
                  <th class="py-3 px-4 text-center">Quantity</th>
                  <th class="py-3 px-4 text-right">Unit Price</th>
                  <th class="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of order.orderItems; track item.id) {
                  <tr>
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900 dark:text-white">{{ item.product?.name || 'Product #' + item.productId }}</div>
                      <div class="text-[11px] text-slate-400 font-mono">SKU: {{ item.product?.sku || 'N/A' }}</div>
                    </td>
                    <td class="py-3 px-4 text-center font-mono font-bold">{{ item.quantity }}</td>
                    <td class="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <div class="text-right">
              <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">Gross Total</span>
              <p class="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
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
