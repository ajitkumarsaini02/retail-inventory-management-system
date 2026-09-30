import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { Supplier, Product, PurchaseOrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

interface LineItemDraft {
  product: Product;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <button
          (click)="router.navigate(['/purchase-orders'])"
          class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <app-icon name="arrow-left" className="w-5 h-5"></app-icon>
        </button>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Procurement Purchase Order
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
            Procure inventory stock from authorized vendors and log replenishment batches
          </p>
        </div>
      </div>

      <!-- Error Banner -->
      @if (errorMessage) {
        <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <app-icon name="alert-triangle" className="w-4 h-4 shrink-0"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>
          <button (click)="errorMessage = ''" class="text-rose-400 hover:text-rose-600 cursor-pointer">
            <app-icon name="x" className="w-4 h-4"></app-icon>
          </button>
        </div>
      }

      <!-- Form Container -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Primary PO Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <!-- PO Number -->
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                PO Tracking # <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                [(ngModel)]="poNumber"
                name="poNumber"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <!-- Supplier -->
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Supplier Vendor <span class="text-rose-500">*</span>
              </label>
              <select
                required
                [(ngModel)]="selectedSupplierId"
                name="supplier"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="">Select a vendor...</option>
                @for (supp of suppliers; track supp.id) {
                  <option [value]="supp.id">{{ supp.name }} ({{ supp.city || 'Verified' }})</option>
                }
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Initial Status
              </label>
              <select
                [(ngModel)]="status"
                name="status"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ORDERED">ORDERED</option>
                <option value="RECEIVED">RECEIVED</option>
              </select>
            </div>

            <!-- Expected Delivery Date -->
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Expected Delivery <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                [(ngModel)]="expectedDeliveryDate"
                name="expectedDeliveryDate"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <!-- Add Line Item Panel -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Procurement Line Items
            </h3>

            <div class="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <!-- Product Select -->
              <div class="sm:col-span-5">
                <label class="block text-[11px] font-bold text-slate-500 mb-1">Select SKU Product</label>
                <select
                  [(ngModel)]="currentProductId"
                  (change)="onProductChange()"
                  name="currentProductId"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Choose product...</option>
                  @for (prod of products; track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} (SKU: {{ prod.sku }})</option>
                  }
                </select>
              </div>

              <!-- Quantity -->
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-slate-500 mb-1">Restock Qty</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="currentQuantity"
                  name="currentQuantity"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <!-- Unit Cost -->
              <div class="sm:col-span-3">
                <label class="block text-[11px] font-bold text-slate-500 mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="currentUnitCost"
                  name="currentUnitCost"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <!-- Add Button -->
              <div class="sm:col-span-2">
                <button
                  type="button"
                  (click)="addItem()"
                  class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <!-- Table of Line Items -->
            <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th class="py-2.5 px-3">Product Name & SKU</th>
                    <th class="py-2.5 px-3 text-right">Unit Cost</th>
                    <th class="py-2.5 px-3 text-right">Qty</th>
                    <th class="py-2.5 px-3 text-right">Subtotal</th>
                    <th class="py-2.5 px-3 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @if (items.length === 0) {
                    <tr>
                      <td colspan="5" class="py-6 text-center text-slate-400">
                        No products added yet. Select a product above to add to this consignment PO.
                      </td>
                    </tr>
                  } @else {
                    @for (item of items; track $index) {
                      <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td class="py-2.5 px-3">
                          <span class="font-bold text-slate-900 dark:text-white">{{ item.product.name }}</span>
                          <span class="block text-[10px] font-mono text-slate-400">{{ item.product.sku }}</span>
                        </td>
                        <td class="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          \${{ item.unitCost | number:'1.2-2' }}
                        </td>
                        <td class="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {{ item.quantity }}
                        </td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                          \${{ item.subtotal | number:'1.2-2' }}
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            (click)="removeItem($index)"
                            class="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <app-icon name="trash" className="w-3.5 h-3.5"></app-icon>
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Total Calculation Banner -->
          <div class="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/60 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="text-xs text-slate-500 space-y-0.5">
              <p>Items in Order: <strong class="text-slate-800 dark:text-slate-200">{{ items.length }}</strong></p>
              <p>Total Units: <strong class="text-slate-800 dark:text-slate-200">{{ totalQuantity }}</strong></p>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 font-semibold block uppercase">Total Procurement Value</span>
              <span class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                \${{ totalAmount | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              (click)="router.navigate(['/purchase-orders'])"
              class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting || items.length === 0"
              class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <app-icon name="check" className="w-4 h-4"></app-icon>
              <span>{{ isSubmitting ? 'Creating PO...' : 'Issue Purchase Order' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PurchaseOrderFormComponent implements OnInit {
  router = inject(Router);
  private poService = inject(PurchaseOrderService);
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];
  products: Product[] = [];
  items: LineItemDraft[] = [];

  poNumber = `PO-${Date.now()}`;
  selectedSupplierId = '';
  status: PurchaseOrderStatus = 'PENDING';
  expectedDeliveryDate = '';

  currentProductId = '';
  currentQuantity = 10;
  currentUnitCost = 0;

  isSubmitting = false;
  errorMessage = '';

  ngOnInit() {
    this.supplierService.getAllSuppliers().subscribe({
      next: (s) => {
        this.suppliers = s || [];
        this.cdr.markForCheck();
      }
    });

    this.productService.getAllProducts().subscribe({
      next: (p) => {
        this.products = p || [];
        this.cdr.markForCheck();
      }
    });

    // Default expected delivery date: 7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    this.expectedDeliveryDate = nextWeek.toISOString().substring(0, 10);
  }

  onProductChange() {
    const prod = this.products.find((p) => p.id === Number(this.currentProductId));
    if (prod) {
      this.currentUnitCost = prod.unitCost || prod.price * 0.7 || 10;
    }
  }

  addItem() {
    if (!this.currentProductId) {
      this.errorMessage = 'Please select a product to add.';
      return;
    }

    const prod = this.products.find((p) => p.id === Number(this.currentProductId));
    if (!prod) return;

    if (this.currentQuantity <= 0) {
      this.errorMessage = 'Quantity must be at least 1.';
      return;
    }

    this.errorMessage = '';
    const subtotal = Number((this.currentQuantity * this.currentUnitCost).toFixed(2));

    this.items.push({
      product: prod,
      quantity: this.currentQuantity,
      unitCost: this.currentUnitCost,
      subtotal
    });

    // Reset item input
    this.currentProductId = '';
    this.currentQuantity = 10;
    this.currentUnitCost = 0;
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  get totalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  onSubmit() {
    if (!this.selectedSupplierId) {
      this.errorMessage = 'Please select an authorized supplier.';
      return;
    }

    if (this.items.length === 0) {
      this.errorMessage = 'Please add at least one line item to the purchase order.';
      return;
    }

    if (!this.expectedDeliveryDate) {
      this.errorMessage = 'Please specify the expected delivery date.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      purchaseOrderNumber: this.poNumber,
      supplier: { id: Number(this.selectedSupplierId) } as any,
      status: this.status,
      totalAmount: Number(this.totalAmount.toFixed(2)),
      expectedDeliveryDate: `${this.expectedDeliveryDate}T18:00:00`,
      purchaseOrderItems: this.items.map((i) => ({
        product: { id: i.product.id } as any,
        quantity: i.quantity,
        unitCost: i.unitCost,
        subtotal: i.subtotal
      }))
    };

    this.poService.createPurchaseOrder(payload).subscribe({
      next: () => {
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create purchase order: ' + (err.error?.message || err.message);
      }
    });
  }
}
