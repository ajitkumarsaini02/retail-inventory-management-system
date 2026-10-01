import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_PURCHASE_ORDERS } from '../../../constants/initial-data';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="py-16 text-center text-[#94A3B8] dark:text-[#64748B]">
          <div class="inline-block animate-spin mb-3">
            <app-icon name="refresh" className="w-6 h-6 text-[#6C3BFF]"></app-icon>
          </div>
          <p class="text-sm">Loading purchase order details...</p>
        </div>
      } @else if (!po) {
        <div class="p-8 text-center bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45]">
          <p class="text-red-500 font-bold mb-4">Purchase order not found</p>
          <button
            (click)="router.navigate(['/purchase-orders'])"
            class="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F5F3FF] dark:bg-[#11172B] dark:hover:bg-[#1B2140] text-xs font-semibold rounded-xl text-[#0F172A] dark:text-[#F8FAFC]"
          >
            Back to Purchase Orders
          </button>
        </div>
      } @else {
        <!-- Top Action & Status Bar -->
        <div class="bg-white dark:bg-[#141A2E] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              (click)="router.navigate(['/purchase-orders'])"
              class="p-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
            >
              <app-icon name="arrow-left" className="w-5 h-5"></app-icon>
            </button>
            <div>
              <div class="flex items-center gap-2.5">
                <h1 class="text-xl sm:text-2xl font-extrabold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
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
              <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                Created {{ po.createdAt ? (po.createdAt | date:'medium') : (po.orderDate | date:'mediumDate') }}
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              (click)="printSlip()"
              class="px-3.5 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#11172B] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <app-icon name="printer" className="w-3.5 h-3.5"></app-icon>
              <span>Print Slip</span>
            </button>

            <!-- Status updater dropdown -->
            <select
              [(ngModel)]="selectedStatus"
              class="px-3 py-2 text-xs font-semibold rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
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
              class="px-4 py-2 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {{ isUpdating ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>

        <!-- Information Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Supplier Info Card -->
          <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-5 shadow-xs space-y-3">
            <div class="flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm border-b border-[#E2E8F0] dark:border-[#252C45] pb-3">
              <app-icon name="truck" className="w-4 h-4 text-[#6C3BFF]"></app-icon>
              <span>Authorized Vendor / Supplier</span>
            </div>

            @if (po.supplier) {
              <div class="text-xs space-y-2 text-[#475569] dark:text-[#94A3B8]">
                <p class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ po.supplier.name }}</p>
                <p><span class="text-[#64748B] font-medium">Contact Person:</span> {{ po.supplier.contactPerson || 'N/A' }}</p>
                <p><span class="text-[#64748B] font-medium">Email:</span> {{ po.supplier.email }}</p>
                <p><span class="text-[#64748B] font-medium">Phone:</span> {{ po.supplier.phone }}</p>
                <p><span class="text-[#64748B] font-medium">Address:</span> {{ po.supplier.address }}, {{ po.supplier.city }}, {{ po.supplier.state }}</p>
              </div>
            } @else {
              <p class="text-xs text-[#64748B]">No linked supplier profile</p>
            }
          </div>

          <!-- Schedule & Logistics -->
          <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-5 shadow-xs space-y-3">
            <div class="flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm border-b border-[#E2E8F0] dark:border-[#252C45] pb-3">
              <app-icon name="calendar" className="w-4 h-4 text-[#6C3BFF]"></app-icon>
              <span>Consignment Schedule & Dates</span>
            </div>

            <div class="text-xs space-y-2.5 text-[#475569] dark:text-[#94A3B8]">
              <div>
                <span class="text-[#64748B] font-medium block">Expected Delivery:</span>
                <p class="text-sm font-bold text-[#6C3BFF] dark:text-[#A78BFA] mt-0.5">
                  {{ po.expectedDeliveryDate ? (po.expectedDeliveryDate | date:'longDate') : 'Unscheduled' }}
                </p>
              </div>
              <div>
                <span class="text-[#64748B] font-medium block">Order Date:</span>
                <p class="text-[#0F172A] dark:text-[#F8FAFC]">{{ po.orderDate ? (po.orderDate | date:'medium') : 'N/A' }}</p>
              </div>
              <div>
                <span class="text-[#64748B] font-medium block">Last System Update:</span>
                <p class="text-[#0F172A] dark:text-[#F8FAFC]">{{ po.updatedAt ? (po.updatedAt | date:'medium') : 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
          <div class="p-4 border-b border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-between">
            <div class="flex items-center gap-2 font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
              <app-icon name="package" className="w-4 h-4 text-[#6C3BFF]"></app-icon>
              <span>Procured SKU Consignment Items</span>
            </div>
            <span class="text-xs text-[#475569] dark:text-[#94A3B8]">{{ po.purchaseOrderItems.length || 0 }} line item(s)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
                <tr>
                  <th class="py-3 px-4">Product Details</th>
                  <th class="py-3 px-4 text-right">Unit Cost</th>
                  <th class="py-3 px-4 text-right">Replenishment Qty</th>
                  <th class="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
                @for (item of po.purchaseOrderItems; track $index) {
                  <tr class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60">
                    <td class="py-3 px-4">
                      <span class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {{ item.product?.name || ('Product #' + item.productId) }}
                      </span>
                      @if (item.product?.sku) {
                        <span class="block text-[10px] font-mono text-[#6C3BFF] dark:text-[#A78BFA]">{{ item.product?.sku }}</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-[#475569] dark:text-[#94A3B8]">
                      \${{ item.unitCost | number:'1.2-2' }}
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {{ item.quantity }}
                    </td>
                    <td class="py-3 px-4 text-right font-extrabold text-[#6C3BFF] dark:text-[#A78BFA] font-mono">
                      \${{ (item.unitCost * item.quantity) | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 border-t border-[#E2E8F0] dark:border-[#252C45]">
                <tr>
                  <td colspan="3" class="py-3.5 px-4 text-right font-bold text-[#475569] dark:text-[#94A3B8]">
                    Grand Total Procurement Amount:
                  </td>
                  <td class="py-3.5 px-4 text-right font-extrabold text-base text-[#6C3BFF] dark:text-[#A78BFA] font-mono">
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
      const numId = Number(id);
      const initialPo = INITIAL_PURCHASE_ORDERS.find((p) => p.id === numId);
      if (initialPo) {
        this.po = initialPo;
        this.selectedStatus = initialPo.status;
        this.isLoading = false;
      }
      this.loadPO(numId);
    }
  }

  loadPO(id: number) {
    if (!this.po) {
      this.isLoading = true;
    }
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
        return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25';
      case 'ORDERED':
        return 'bg-blue-500/15 text-blue-500 border border-blue-500/25';
      case 'APPROVED':
        return 'bg-[#6C3BFF]/15 text-[#6C3BFF] dark:text-[#A78BFA] border border-[#6C3BFF]/25';
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-500 border border-amber-500/25';
      case 'CANCELLED':
        return 'bg-red-500/15 text-red-500 border border-red-500/25';
      default:
        return 'bg-slate-500/15 text-slate-500 border border-slate-500/25';
    }
  }

  getStatusDotClass(status: PurchaseOrderStatus): string {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-500';
      case 'ORDERED':
        return 'bg-blue-500';
      case 'APPROVED':
        return 'bg-[#6C3BFF]';
      case 'PENDING':
        return 'bg-amber-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  }
}
