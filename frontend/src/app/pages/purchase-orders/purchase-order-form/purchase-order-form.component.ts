import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { SupplierService } from '../../../services/supplier.service';
import { ProductService } from '../../../services/product.service';
import { Supplier, Product, PurchaseOrderStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_SUPPLIERS, INITIAL_PRODUCTS } from '../../../constants/initial-data';

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
          class="p-2 rounded-xl text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
        >
          <app-icon name="arrow-left" className="w-5 h-5"></app-icon>
        </button>
        <div>
          <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Create Procurement Purchase Order
          </h1>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Procure inventory stock from authorized vendors and log replenishment batches
          </p>
        </div>
      </div>

      <!-- Error Banner -->
      @if (errorMessage) {
        <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <app-icon name="alert-triangle" className="w-4 h-4 shrink-0"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>
          <button (click)="errorMessage = ''" class="text-red-400 hover:text-red-600 cursor-pointer">
            <app-icon name="x" className="w-4 h-4"></app-icon>
          </button>
        </div>
      }

      <!-- Form Container -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-6 sm:p-8 shadow-xs">
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Primary PO Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <!-- PO Number -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                PO Tracking # <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                [(ngModel)]="poNumber"
                name="poNumber"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#6C3BFF] dark:text-[#A78BFA] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <!-- Supplier -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Supplier Vendor <span class="text-red-500">*</span>
              </label>
              <select
                required
                [(ngModel)]="selectedSupplierId"
                name="supplier"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
              >
                <option value="">Select a vendor...</option>
                @for (supp of suppliers; track supp.id) {
                  <option [value]="supp.id">{{ supp.name }} ({{ supp.city || 'Verified' }})</option>
                }
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Initial Status
              </label>
              <select
                [(ngModel)]="status"
                name="status"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ORDERED">ORDERED</option>
                <option value="RECEIVED">RECEIVED</option>
              </select>
            </div>

            <!-- Expected Delivery Date -->
            <div>
              <label class="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Expected Delivery <span class="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                [(ngModel)]="expectedDeliveryDate"
                name="expectedDeliveryDate"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <!-- Add Line Item Panel -->
          <div class="pt-4 border-t border-[#E2E8F0] dark:border-[#252C45] space-y-3">
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
              Procurement Line Items
            </h3>

            <div class="p-4 rounded-xl bg-[#F8FAFC]/80 dark:bg-[#10152A]/80 border border-[#E2E8F0] dark:border-[#252C45] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <!-- Product Select -->
              <div class="sm:col-span-5">
                <label class="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">Select SKU Product</label>
                <select
                  [(ngModel)]="currentProductId"
                  (change)="onProductChange()"
                  name="currentProductId"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#252C45] bg-white dark:bg-[#141A2E] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
                >
                  <option value="">Choose product...</option>
                  @for (prod of products; track prod.id) {
                    <option [value]="prod.id">{{ prod.name }} (SKU: {{ prod.sku }})</option>
                  }
                </select>
              </div>

              <!-- Quantity -->
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">Restock Qty</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="currentQuantity"
                  name="currentQuantity"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#252C45] bg-white dark:bg-[#141A2E] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF]"
                />
              </div>

              <!-- Unit Cost -->
              <div class="sm:col-span-3">
                <label class="block text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="currentUnitCost"
                  name="currentUnitCost"
                  class="w-full px-3 py-2 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#252C45] bg-white dark:bg-[#141A2E] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF]"
                />
              </div>

              <!-- Add Button -->
              <div class="sm:col-span-2">
                <button
                  type="button"
                  (click)="addItem()"
                  class="w-full py-2 bg-[#6C3BFF] hover:bg-[#7C4DFF] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <!-- Table of Line Items -->
            <div class="border border-[#E2E8F0] dark:border-[#252C45] rounded-xl overflow-hidden">
              <table class="w-full text-xs text-left">
                <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[#475569] dark:text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0] dark:border-[#252C45]">
                  <tr>
                    <th class="py-2.5 px-3">Product Name & SKU</th>
                    <th class="py-2.5 px-3 text-right">Unit Cost</th>
                    <th class="py-2.5 px-3 text-right">Qty</th>
                    <th class="py-2.5 px-3 text-right">Subtotal</th>
                    <th class="py-2.5 px-3 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
                  @if (items.length === 0) {
                    <tr>
                      <td colspan="5" class="py-6 text-center text-[#94A3B8] dark:text-[#64748B]">
                        No products added yet. Select a product above to add to this consignment PO.
                      </td>
                    </tr>
                  } @else {
                    @for (item of items; track $index) {
                      <tr class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60">
                        <td class="py-2.5 px-3">
                          <span class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ item.product.name }}</span>
                          <span class="block text-[10px] font-mono text-[#6C3BFF] dark:text-[#A78BFA]">{{ item.product.sku }}</span>
                        </td>
                        <td class="py-2.5 px-3 text-right font-mono text-[#475569] dark:text-[#94A3B8]">
                          \${{ item.unitCost | number:'1.2-2' }}
                        </td>
                        <td class="py-2.5 px-3 text-right font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {{ item.quantity }}
                        </td>
                        <td class="py-2.5 px-3 text-right font-extrabold text-[#6C3BFF] dark:text-[#A78BFA] font-mono">
                          \${{ item.subtotal | number:'1.2-2' }}
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            (click)="removeItem($index)"
                            class="p-1 text-red-400 hover:text-red-600 transition cursor-pointer"
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
          <div class="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#10152A] border border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-between">
            <div class="text-xs text-[#475569] dark:text-[#94A3B8] space-y-0.5">
              <p>Items in Order: <strong class="text-[#0F172A] dark:text-[#F8FAFC]">{{ items.length }}</strong></p>
              <p>Total Units: <strong class="text-[#0F172A] dark:text-[#F8FAFC]">{{ totalQuantity }}</strong></p>
            </div>
            <div class="text-right">
              <span class="text-xs text-[#475569] dark:text-[#94A3B8] font-semibold block uppercase">Total Procurement Value</span>
              <span class="text-2xl font-extrabold text-[#6C3BFF] dark:text-[#A78BFA] font-mono">
                \${{ totalAmount | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#252C45]">
            <button
              type="button"
              (click)="router.navigate(['/purchase-orders'])"
              class="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting || items.length === 0"
              class="px-6 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

  suppliers: Supplier[] = [...INITIAL_SUPPLIERS];
  products: Product[] = [...INITIAL_PRODUCTS];
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
  }

  onProductChange() {
    if (!this.currentProductId) return;
    const prod = this.products.find((p) => p.id === +this.currentProductId);
    if (prod) {
      this.currentUnitCost = prod.costPrice || prod.unitCost || 0;
    }
  }

  addItem() {
    if (!this.currentProductId) return;
    const prod = this.products.find((p) => p.id === +this.currentProductId);
    if (!prod) return;

    if (this.currentQuantity <= 0) {
      this.errorMessage = 'Restock quantity must be greater than zero.';
      return;
    }

    const subtotal = this.currentQuantity * this.currentUnitCost;

    const existing = this.items.find((i) => i.product.id === prod.id);
    if (existing) {
      existing.quantity += this.currentQuantity;
      existing.unitCost = this.currentUnitCost;
      existing.subtotal = existing.quantity * existing.unitCost;
    } else {
      this.items.push({
        product: prod,
        quantity: this.currentQuantity,
        unitCost: this.currentUnitCost,
        subtotal
      });
    }

    this.currentProductId = '';
    this.currentQuantity = 10;
    this.currentUnitCost = 0;
    this.errorMessage = '';
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  get totalQuantity(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  get totalAmount(): number {
    return this.items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  onSubmit() {
    if (!this.selectedSupplierId) {
      this.errorMessage = 'Please select a supplier for this purchase order.';
      return;
    }

    if (this.items.length === 0) {
      this.errorMessage = 'Please add at least one line item to the order.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      purchaseOrderNumber: this.poNumber,
      supplierId: +this.selectedSupplierId,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: this.expectedDeliveryDate ? new Date(this.expectedDeliveryDate).toISOString() : undefined,
      status: this.status,
      totalAmount: this.totalAmount,
      purchaseOrderItems: this.items.map((i) => ({
        productId: i.product.id,
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
        this.cdr.markForCheck();
      }
    });
  }
}
