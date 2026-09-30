import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { Customer, Product, Order, OrderItem } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Create Customer Sales Order</h1>
          <p class="text-xs text-slate-400 mt-0.5">Place customer order with live catalog items and stock validation</p>
        </div>
        <button
          (click)="router.navigate(['/orders'])"
          class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <app-icon name="alert-triangle" className="w-4 h-4 shrink-0 text-rose-400"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form (ngSubmit)="saveOrder()" class="space-y-6">
          <!-- Customer Selection & Shipping -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer *</label>
              <select
                [(ngModel)]="selectedCustomerId"
                (change)="onCustomerChange()"
                name="customerId"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option [value]="0">-- Select Customer --</option>
                @for (c of customers; track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.email }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Shipping Address *</label>
              <input
                type="text"
                [(ngModel)]="shippingAddress"
                name="shippingAddress"
                required
                placeholder="Destination address..."
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Order Items Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Order Line Items</h3>
              <button
                type="button"
                (click)="addItem()"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                <span>Add Item</span>
              </button>
            </div>

            <div class="space-y-3">
              @for (item of items; track $index; let i = $index) {
                <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-3">
                  <div class="flex-1 w-full sm:w-auto">
                    <label class="block text-[11px] font-semibold text-slate-400 mb-1">Product</label>
                    <select
                      [(ngModel)]="item.productId"
                      (change)="onProductChange(item)"
                      [name]="'prod_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option [value]="0">-- Select Catalog SKU --</option>
                      @for (p of products; track p.id) {
                        <option [value]="p.id">{{ p.name }} (\${{ p.price }}) - SKU: {{ p.sku }}</option>
                      }
                    </select>
                  </div>

                  <div class="w-full sm:w-28">
                    <label class="block text-[11px] font-semibold text-slate-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="item.quantity"
                      (input)="calculateTotal()"
                      [name]="'qty_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div class="w-full sm:w-28">
                    <label class="block text-[11px] font-semibold text-slate-400 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="item.unitPrice"
                      (input)="calculateTotal()"
                      [name]="'price_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div class="w-full sm:w-28 text-right sm:self-end sm:pb-2">
                    <span class="block text-[11px] text-slate-400 sm:hidden">Subtotal:</span>
                    <span class="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                    </span>
                  </div>

                  @if (items.length > 1) {
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer sm:self-end sm:mb-1"
                    >
                      <app-icon name="x" className="w-4 h-4"></app-icon>
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Total Summary -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Gross Order Total:</span>
            <span class="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">\${{ totalAmount | number:'1.2-2' }}</span>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/orders'])"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {{ isSaving ? 'Processing Order...' : 'Confirm & Place Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OrderFormComponent implements OnInit {
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  customers: Customer[] = [];
  products: Product[] = [];
  selectedCustomerId = 0;
  shippingAddress = '';
  totalAmount = 0;
  isSaving = false;
  errorMessage = '';

  items: { productId: number; quantity: number; unitPrice: number }[] = [
    { productId: 0, quantity: 1, unitPrice: 0 }
  ];

  ngOnInit() {
    forkJoin({
      custs: this.customerService.getAllCustomers(),
      prods: this.productService.getAllProducts()
    }).subscribe({
      next: (res) => {
        this.customers = res.custs || [];
        this.products = res.prods || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  onCustomerChange() {
    const cust = this.customers.find(c => c.id === Number(this.selectedCustomerId));
    if (cust && cust.address) {
      this.shippingAddress = `${cust.address}, ${cust.city}, ${cust.state} - ${cust.pincode}`;
    }
  }

  onProductChange(item: { productId: number; quantity: number; unitPrice: number }) {
    const p = this.products.find(prod => prod.id === Number(item.productId));
    if (p) {
      item.unitPrice = Number(p.price) || 0;
    }
    this.calculateTotal();
  }

  addItem() {
    this.items.push({ productId: 0, quantity: 1, unitPrice: 0 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  }

  saveOrder() {
    if (!this.selectedCustomerId || Number(this.selectedCustomerId) === 0) {
      this.errorMessage = 'Please select a customer for this order.';
      return;
    }
    if (!this.shippingAddress) {
      this.errorMessage = 'Please provide a shipping address.';
      return;
    }
    const validItems = this.items.filter(i => i.productId && Number(i.productId) > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      this.errorMessage = 'Please select at least one valid product item.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const orderPayload: Partial<Order> = {
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customer: { id: Number(this.selectedCustomerId) } as any,
      orderDate: new Date().toISOString(),
      status: 'PENDING',
      totalAmount: this.totalAmount,
      shippingAddress: this.shippingAddress,
      orderItems: validItems.map(i => ({
        product: { id: Number(i.productId) } as any,
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice)
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (created) => {
        this.isSaving = false;
        this.router.navigate(['/orders', created.id]);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to place customer order. Please verify stock availability.';
      }
    });
  }
}
