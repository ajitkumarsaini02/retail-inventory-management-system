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
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Purchase Orders (Procurement)
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">
            Supplier purchase consignments, replenishment orders, and inbound inventory
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            (click)="loadOrders()"
            class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Refresh list"
          >
            <app-icon name="refresh-cw" className="w-4 h-4"></app-icon>
          </button>
          <button
            (click)="router.navigate(['/purchase-orders/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <!-- Search -->
          <div class="relative w-full sm:w-72">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <app-icon name="search" className="w-4 h-4"></app-icon>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search PO # or supplier..."
              class="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <!-- Status Filter -->
          <select
            [(ngModel)]="statusFilter"
            class="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
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
          <span class="text-xs text-slate-400 font-medium">
            Showing <strong class="text-slate-700 dark:text-slate-200">{{ filteredOrders.length }}</strong> orders
          </span>
          <button
            (click)="exportCSV()"
            [disabled]="filteredOrders.length === 0"
            class="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <app-icon name="download" className="w-3.5 h-3.5"></app-icon>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4 font-mono">PO Number</th>
                <th class="py-3.5 px-4">Supplier / Vendor</th>
                <th class="py-3.5 px-4 text-right">Total Amount</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                <th class="py-3.5 px-4">Expected Delivery</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @if (isLoading) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400">Loading purchase orders...</td>
                </tr>
              } @else if (filteredOrders.length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                        <app-icon name="file-spreadsheet" className="w-6 h-6"></app-icon>
                      </div>
                      <p class="font-bold text-slate-700 dark:text-slate-200">No purchase orders found</p>
                      <p class="text-xs text-slate-400 mt-0.5">Create a purchase order to initiate replenishment with vendors</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (po of filteredOrders; track po.id) {
                  <tr
                    (click)="router.navigate(['/purchase-orders', po.id])"
                    class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {{ po.purchaseOrderNumber }}
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {{ po.supplier?.name || 'Unknown Supplier' }}
                      </div>
                      @if (po.supplier?.contactPerson) {
                        <span class="text-[11px] text-slate-400">Attn: {{ po.supplier?.contactPerson }}</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                      \${{ po.totalAmount | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        [ngClass]="getStatusBadgeClass(po.status)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(po.status)"></span>
                        {{ po.status }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {{ po.expectedDeliveryDate ? (po.expectedDeliveryDate | date:'mediumDate') : '—' }}
                    </td>
                    <td class="py-3.5 px-4 text-right" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          (click)="router.navigate(['/purchase-orders', po.id])"
                          title="View PO Details"
                          class="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                          <app-icon name="eye" className="w-4 h-4"></app-icon>
                        </button>
                        <button
                          (click)="openDeleteModal(po)"
                          title="Delete PO"
                          class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
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
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div class="flex items-center gap-3 text-rose-600">
              <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                <app-icon name="trash" className="w-5 h-5"></app-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-slate-900 dark:text-white">Delete Purchase Order</h3>
                <p class="text-xs text-slate-400 font-mono">{{ deleteTarget.purchaseOrderNumber }}</p>
              </div>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete this purchase order? This action cannot be reversed.
            </p>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button
                (click)="deleteTarget = null"
                class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                (click)="confirmDelete()"
                [disabled]="isDeleting"
                class="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Purchase Order' }}
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
  searchQuery = '';
  statusFilter = 'ALL';

  deleteTarget: PurchaseOrder | null = null;
  isDeleting = false;

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
