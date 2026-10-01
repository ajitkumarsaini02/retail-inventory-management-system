import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Purchase Orders (Procurement)
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F97316]/10 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/20">
              {{ filteredOrders.length }} In-Flight POs
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            Supplier purchase consignments, replenishment orders, line item pricing, and inbound receipts
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            (click)="loadOrders()"
            class="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-white dark:bg-[#141A2E] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
            title="Refresh list"
          >
            <app-icon name="refresh" className="w-4 h-4"></app-icon>
          </button>
          <button
            (click)="router.navigate(['/purchase-orders/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <!-- Search -->
          <div class="relative w-full sm:w-72">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#64748B]">
              <app-icon name="search" className="w-4 h-4"></app-icon>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search PO # or supplier..."
              class="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
            />
          </div>

          <!-- Status Filter -->
          <select
            [(ngModel)]="statusFilter"
            class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ORDERED">ORDERED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span class="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
            Showing <strong class="text-[#0F172A] dark:text-[#F8FAFC]">{{ filteredOrders.length }}</strong> orders
          </span>
          <button
            (click)="exportCSV()"
            [disabled]="filteredOrders.length === 0"
            class="px-3.5 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#11172B] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <app-icon name="download" className="w-3.5 h-3.5"></app-icon>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4 font-mono">PO Number</th>
                <th class="py-3.5 px-4">Supplier</th>
                <th class="py-3.5 px-4 text-right">Total Amount</th>
                <th class="py-3.5 px-4">Expected Delivery</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading purchase orders...</td>
                </tr>
              } @else if (filteredOrders.length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-12 h-12 rounded-2xl bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-center mb-3 text-[#94A3B8]">
                        <app-icon name="file-spreadsheet" className="w-6 h-6"></app-icon>
                      </div>
                      <p class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">No purchase orders found</p>
                      <p class="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">Create a purchase order to initiate replenishment with suppliers</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (po of filteredOrders; track po.id) {
                  <tr
                    (click)="router.navigate(['/purchase-orders', po.id])"
                    class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition-colors cursor-pointer group"
                  >
                    <td class="py-3.5 px-4 font-mono font-bold text-[#6C3BFF] dark:text-[#A78BFA] whitespace-nowrap">
                      {{ po.purchaseOrderNumber }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#6C3BFF] transition-colors">
                        {{ po.supplier?.name || 'Unknown Supplier' }}
                      </div>
                      @if (po.supplier?.contactPerson) {
                        <span class="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Attn: {{ po.supplier?.contactPerson }}</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-[#0F172A] dark:text-[#F8FAFC] font-mono whitespace-nowrap">
                      \${{ po.totalAmount | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-[#475569] dark:text-[#94A3B8] text-xs whitespace-nowrap">
                      {{ po.expectedDeliveryDate ? (po.expectedDeliveryDate | date:'mediumDate') : '—' }}
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        [ngClass]="getStatusBadgeClass(po.status)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(po.status)"></span>
                        {{ po.status }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          (click)="router.navigate(['/purchase-orders', po.id])"
                          title="View PO Details"
                          class="p-1.5 text-[#475569] dark:text-[#94A3B8] hover:text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition cursor-pointer"
                        >
                          <app-icon name="eye" className="w-4 h-4"></app-icon>
                        </button>
                        <button
                          (click)="openDeleteModal(po)"
                          title="Delete PO"
                          class="p-1.5 text-[#475569] dark:text-[#94A3B8] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        >
                          <app-icon name="trash" className="w-4 h-4"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Modal -->
      @if (deleteTarget) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-3 text-red-500">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <app-icon name="trash" className="w-5 h-5"></app-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">Delete Purchase Order</h3>
                <p class="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">{{ deleteTarget.purchaseOrderNumber }}</p>
              </div>
            </div>

            <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8]">
              Are you sure you want to permanently delete this purchase order? This action cannot be reversed.
            </p>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button
                (click)="deleteTarget = null"
                class="px-4 py-2 text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                (click)="confirmDelete()"
                [disabled]="isDeleting"
                class="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                @if (isDeleting) {
                  <app-icon name="refresh" className="w-3.5 h-3.5 animate-spin"></app-icon>
                  <span>Deleting...</span>
                } @else {
                  <span>Delete Order</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PurchaseOrderListComponent implements OnInit {
  router = inject(Router);
  private poService = inject(PurchaseOrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: PurchaseOrder[] = [];
  isLoading = true;
  isDeleting = false;
  searchQuery = '';
  statusFilter = 'ALL';
  deleteTarget: PurchaseOrder | null = null;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.poService.getAllPurchaseOrders().subscribe({
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

  get filteredOrders(): PurchaseOrder[] {
    return this.orders.filter((po) => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch =
        po.purchaseOrderNumber?.toLowerCase().includes(q) ||
        po.supplier?.name?.toLowerCase().includes(q);

      const matchStatus = this.statusFilter === 'ALL' || po.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
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

  openDeleteModal(po: PurchaseOrder) {
    this.deleteTarget = po;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.poService.deletePurchaseOrder(this.deleteTarget.id).subscribe({
      next: () => {
        this.orders = this.orders.filter((o) => o.id !== this.deleteTarget?.id);
        this.deleteTarget = null;
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
      }
    });
  }

  exportCSV() {
    if (this.filteredOrders.length === 0) return;
    const headers = ['PO Number', 'Supplier', 'Total Amount', 'Status', 'Expected Delivery'];
    const rows = this.filteredOrders.map((po) => [
      `"${po.purchaseOrderNumber || ''}"`,
      `"${(po.supplier?.name || '').replace(/"/g, '""')}"`,
      po.totalAmount || 0,
      `"${po.status || ''}"`,
      `"${po.expectedDeliveryDate || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
