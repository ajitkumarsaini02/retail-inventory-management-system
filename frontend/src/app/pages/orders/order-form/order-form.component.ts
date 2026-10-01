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
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS } from '../../../constants/initial-data';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">Create Customer Sales Order</h1>
          <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Place customer order with live catalog items and stock validation</p>
        </div>
        <button
          (click)="router.navigate(['/orders'])"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
        >
          <app-icon name="arrow-left" className="w-3.5 h-3.5"></app-icon>
          <span>Cancel</span>
        </button>
      </div>

      <div class="bg-white dark:bg-[#141A2E] rounded-3xl border border-[#E2E8F0] dark:border-[#252C45] p-6 sm:p-8 shadow-xs">
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <app-icon name="alert-triangle" className="w-4 h-4 shrink-0 text-red-500"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <form (ngSubmit)="saveOrder()" class="space-y-6">
          <!-- Customer Selection & Shipping -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Customer *</label>
              <select
                [(ngModel)]="selectedCustomerId"
                (change)="onCustomerChange()"
                name="customerId"
                required
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] cursor-pointer"
              >
                <option [value]="0">-- Select Customer --</option>
                @for (c of customers; track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.email }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Shipping Address *</label>
              <input
                type="text"
                [(ngModel)]="shippingAddress"
                name="shippingAddress"
                required
                placeholder="Destination delivery address..."
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <!-- Order Items Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Order Line Items</h3>
              <button
                type="button"
                (click)="addItem()"
                class="px-3 py-1.5 bg-[#6C3BFF]/10 hover:bg-[#6C3BFF]/20 text-[#6C3BFF] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer border border-[#6C3BFF]/25"
              >
                <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                <span>Add Item</span>
              </button>
            </div>

            <div class="space-y-3">
              @for (item of items; track $index; let i = $index) {
                <div class="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC]/50 dark:bg-[#10152A]/50 flex flex-col sm:flex-row items-center gap-3">
                  <div class="flex-1 w-full sm:w-auto">
                    <label class="block text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] mb-1">Product SKU</label>
                    <select
                      [(ngModel)]="item.productId"
                      (change)="onProductChange(item)"
                      [name]="'prod_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
                    >
                      <option [value]="0">-- Select Catalog SKU --</option>
                      @for (p of products; track p.id) {
                        <option [value]="p.id">{{ p.name }} (\${{ p.price }}) - SKU: {{ p.sku }}</option>
                      }
                    </select>
                  </div>

                  <div class="w-full sm:w-28">
                    <label class="block text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="item.quantity"
                      (input)="calculateTotal()"
                      [name]="'qty_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-lg text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF]"
                    />
                  </div>

                  <div class="w-full sm:w-28">
                    <label class="block text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="item.unitPrice"
                      (input)="calculateTotal()"
                      [name]="'price_' + i"
                      class="w-full px-3 py-2 bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-lg text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF]"
                    />
                  </div>

                  <div class="w-full sm:w-28 text-right sm:self-end sm:pb-2">
                    <span class="block text-[11px] text-[#475569] dark:text-[#94A3B8] sm:hidden">Subtotal:</span>
                    <span class="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                      \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                    </span>
                  </div>

                  @if (items.length > 1) {
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer sm:self-end sm:mb-1"
                    >
                      <app-icon name="x" className="w-4 h-4"></app-icon>
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Total Summary -->
          <div class="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#10152A] border border-[#E2E8F0] dark:border-[#252C45] flex items-center justify-between">
            <span class="text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Gross Order Total:</span>
            <span class="text-2xl font-extrabold font-mono text-[#6C3BFF] dark:text-[#A78BFA]">\${{ totalAmount | number:'1.2-2' }}</span>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/orders'])"
              class="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="px-5 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isSaving) {
                <app-icon name="refresh" className="w-4 h-4 animate-spin"></app-icon>
                <span>Processing Order...</span>
              } @else {
                <app-icon name="check" className="w-4 h-4"></app-icon>
                <span>Confirm & Place Order</span>
              }
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

  customers: Customer[] = [...INITIAL_CUSTOMERS];
  products: Product[] = [...INITIAL_PRODUCTS];
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
      }
    });
  }

  onCustomerChange() {
    const cust = this.customers.find((c) => c.id === +this.selectedCustomerId);
    if (cust) {
      this.shippingAddress = `${cust.address}, ${cust.city}, ${cust.state} - ${cust.pincode}`;
    }
  }

  onProductChange(item: { productId: number; quantity: number; unitPrice: number }) {
    const prod = this.products.find((p) => p.id === +item.productId);
    if (prod) {
      item.unitPrice = prod.price;
      this.calculateTotal();
    }
  }

  addItem() {
    this.items.push({ productId: 0, quantity: 1, unitPrice: 0 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  saveOrder() {
    if (!this.selectedCustomerId) {
      this.errorMessage = 'Please select a valid customer.';
      return;
    }
    const validItems = this.items.filter((i) => i.productId > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      this.errorMessage = 'Please add at least one line item to the order.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const newOrder: Partial<Order> = {
      customerId: +this.selectedCustomerId,
      shippingAddress: this.shippingAddress,
      totalAmount: this.totalAmount,
      orderDate: new Date().toISOString(),
      orderItems: validItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    };

    this.orderService.createOrder(newOrder as Order).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to place customer order.';
        this.cdr.markForCheck();
      }
    });
  }
}
