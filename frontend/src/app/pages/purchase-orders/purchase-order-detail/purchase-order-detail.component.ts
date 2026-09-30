import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="py-16 text-center text-slate-400">
          <div class="inline-block animate-spin mb-3">
            <app-icon name="refresh-cw" className="w-6 h-6 text-indigo-600"></app-icon>
          </div>
          <p class="text-sm">Loading purchase order details...</p>
        </div>
      } @else if (!po) {
        <div class="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p class="text-rose-500 font-bold mb-4">Purchase order not found</p>
          <button
            (click)="router.navigate(['/purchase-orders'])"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold rounded-xl"
          >
            Back to Purchase Orders
          </button>
        </div>
      } @else {
        <!-- Top Action & Status Bar -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              (click)="router.navigate(['/purchase-orders'])"
              class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <app-icon name="arrow-left" className="w-5 h-5"></app-icon>
            </button>
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {{ po.purchaseOrderNumber }}
                </h1>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                  [ngClass]="getStatusBadgeClass(po.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(po.status)"></span>
                  {{ po.status }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Created {{ po.createdAt ? (po.createdAt | date:'medium') : (po.orderDate | date:'mediumDate') }}
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              (click)="printSlip()"
              class="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <app-icon name="printer" className="w-3.5 h-3.5"></app-icon>
              <span>Print Slip</span>
            </button>

            <!-- Status updater dropdown -->
            <select
              [(ngModel)]="selectedStatus"
              class="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="ORDERED">ORDERED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
              (click)="updateStatus()"
              [disabled]="isUpdating || selectedStatus === po.status"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {{ isUpdating ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>

        <!-- Information Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Supplier Info Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              <app-icon name="truck" className="w-4 h-4 text-indigo-600"></app-icon>
              <span>Authorized Vendor / Supplier</span>
            </div>

            @if (po.supplier) {
              <div class="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ po.supplier.name }}</p>
                <p><span class="text-slate-400 font-medium">Contact Person:</span> {{ po.supplier.contactPerson || 'N/A' }}</p>
                <p><span class="text-slate-400 font-medium">Email:</span> {{ po.supplier.email }}</p>
                <p><span class="text-slate-400 font-medium">Phone:</span> {{ po.supplier.phone }}</p>
                <p><span class="text-slate-400 font-medium">Address:</span> {{ po.supplier.address }}, {{ po.supplier.city }}, {{ po.supplier.state }}</p>
              </div>
            } @else {
              <p class="text-xs text-slate-400">No linked supplier profile</p>
            }
          </div>

          <!-- Schedule & Logistics -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              <app-icon name="calendar" className="w-4 h-4 text-indigo-600"></app-icon>
              <span>Consignment Schedule & Dates</span>
            </div>

            <div class="text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              <div>
                <span class="text-slate-400 font-medium block">Expected Delivery:</span>
                <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {{ po.expectedDeliveryDate ? (po.expectedDeliveryDate | date:'longDate') : 'Unscheduled' }}
                </p>
              </div>
              <div>
                <span class="text-slate-400 font-medium block">Order Date:</span>
                <p>{{ po.orderDate ? (po.orderDate | date:'medium') : 'N/A' }}</p>
              </div>
              <div>
                <span class="text-slate-400 font-medium block">Last System Update:</span>
                <p>{{ po.updatedAt ? (po.updatedAt | date:'medium') : 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <app-icon name="package" className="w-4 h-4 text-indigo-600"></app-icon>
              <span>Procured SKU Consignment Items</span>
            </div>
            <span class="text-xs text-slate-400">{{ po.purchaseOrderItems.length || 0 }} line item(s)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50/75 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Product Details</th>
                  <th class="py-3 px-4 text-right">Unit Cost</th>
                  <th class="py-3 px-4 text-right">Replenishment Qty</th>
                  <th class="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of po.purchaseOrderItems; track $index) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td class="py-3 px-4">
                      <span class="font-bold text-slate-900 dark:text-white">
                        {{ item.product?.name || ('Product #' + item.productId) }}
                      </span>
                      @if (item.product?.sku) {
                        <span class="block text-[10px] font-mono text-slate-400">{{ item.product?.sku }}</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      \${{ item.unitCost | number:'1.2-2' }}
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {{ item.quantity }}
                    </td>
                    <td class="py-3 px-4 text-right font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      \${{ (item.unitCost * item.quantity) | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-slate-50/75 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800">
                <tr>
                  <td colspan="3" class="py-3.5 px-4 text-right font-bold text-slate-600 dark:text-slate-300">
                    Grand Total Procurement Amount:
                  </td>
                  <td class="py-3.5 px-4 text-right font-extrabold text-base text-indigo-600 dark:text-indigo-400 font-mono">
                    \${{ po.totalAmount | number:'1.2-2' }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class PurchaseOrderDetailComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private poService = inject(PurchaseOrderService);
  private cdr = inject(ChangeDetectorRef);

  po: PurchaseOrder | null = null;
  isLoading = true;
  isUpdating = false;
  selectedStatus: PurchaseOrderStatus = 'PENDING';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPO(Number(id));
    }
  }

  loadPO(id: number) {
    this.isLoading = true;
    this.poService.getPurchaseOrderById(id).subscribe({
      next: (data) => {
        this.po = data;
        this.selectedStatus = data.status;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateStatus() {
    if (!this.po) return;
    this.isUpdating = true;
    const updated = {
      ...this.po,
      status: this.selectedStatus
    };

    this.poService.updatePurchaseOrder(this.po.id, updated).subscribe({
      next: (res) => {
        this.po = res;
        this.selectedStatus = res.status;
        this.isUpdating = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUpdating = false;
        this.cdr.markForCheck();
      }
    });
  }

  printSlip() {
    window.print();
  }

  getStatusBadgeClass(status: PurchaseOrderStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';
      case 'ORDERED':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60';
      case 'APPROVED':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60';
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusDotClass(status: PurchaseOrderStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-500';
      case 'ORDERED':
        return 'bg-blue-500';
      case 'APPROVED':
        return 'bg-indigo-500';
      case 'PENDING':
        return 'bg-amber-500';
      case 'CANCELLED':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}
