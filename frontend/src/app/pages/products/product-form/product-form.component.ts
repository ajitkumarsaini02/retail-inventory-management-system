import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product, ProductStatus } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            {{ isEdit ? 'Edit Product SKU' : 'Add New Product SKU' }}
          </h1>
          <p class="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">Define SKU code, pricing, brand, cost, and reorder levels</p>
        </div>
        <button
          (click)="router.navigate(['/products'])"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
        >
          <app-icon name="arrow-left" className="w-3.5 h-3.5"></app-icon>
          <span>Cancel</span>
        </button>
      </div>

      <div class="bg-white dark:bg-[#141A2E] rounded-3xl border border-[#E2E8F0] dark:border-[#252C45] p-6 sm:p-8 shadow-xs">
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="saveProduct()" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Product Name *</label>
              <input
                type="text"
                [(ngModel)]="product.name"
                name="name"
                required
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">SKU Code *</label>
              <input
                type="text"
                [(ngModel)]="product.sku"
                name="sku"
                required
                placeholder="e.g. ELEC-HP-001"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm font-mono text-[#6C3BFF] dark:text-[#A78BFA] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Category *</label>
              <input
                type="text"
                [(ngModel)]="product.category"
                name="category"
                required
                placeholder="e.g. Electronics"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Brand</label>
              <input
                type="text"
                [(ngModel)]="product.brand"
                name="brand"
                placeholder="e.g. Sony, Logitech"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Retail Price ($) *</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="product.price"
                name="price"
                required
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="product.unitCost"
                name="unitCost"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Reorder Threshold *</label>
              <input
                type="number"
                [(ngModel)]="product.reorderLevel"
                name="reorderLevel"
                required
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Status</label>
              <select
                [(ngModel)]="product.status"
                name="status"
                class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">Description</label>
            <textarea
              [(ngModel)]="product.description"
              name="description"
              rows="3"
              placeholder="Product technical specifications..."
              class="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
            ></textarea>
          </div>

          <div class="pt-4 border-t border-[#E2E8F0] dark:border-[#252C45] flex justify-end gap-3">
            <button
              type="button"
              (click)="router.navigate(['/products'])"
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
                <span>Saving...</span>
              } @else {
                <app-icon name="check" className="w-4 h-4"></app-icon>
                <span>{{ isEdit ? 'Update SKU' : 'Save SKU' }}</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  productId?: number;
  isSaving = false;
  errorMessage = '';

  product: Partial<Product> = {
    name: '',
    sku: '',
    category: '',
    brand: '',
    price: 0,
    unitCost: 0,
    reorderLevel: 10,
    status: 'ACTIVE',
    description: ''
  };

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = +idParam;
      this.productService.getProductById(this.productId).subscribe({
        next: (data) => {
          this.product = data;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to load product details.';
          this.cdr.markForCheck();
        }
      });
    }
  }

  saveProduct() {
    if (!this.product.name || !this.product.sku || !this.product.category) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const req$ = this.isEdit && this.productId
      ? this.productService.updateProduct(this.productId, this.product as Product)
      : this.productService.createProduct(this.product as Product);

    req$.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save product.';
        this.cdr.markForCheck();
      }
    });
  }
}
