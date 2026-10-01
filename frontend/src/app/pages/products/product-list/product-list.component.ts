import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Product Catalog</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6C3BFF]/10 text-[#6C3BFF] border border-[#6C3BFF]/20">
              {{ filteredProducts.length }} SKUs
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Manage retail SKUs, pricing, categories, brands, and reorder levels</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/products/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Add Product</span>
          </button>
        }
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by product name, SKU, or brand..."
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
          />
        </div>

        <!-- Category Filter -->
        <select
          [(ngModel)]="selectedCategory"
          class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          @for (cat of categories; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <!-- Status Filter -->
        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <!-- Products Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4 font-mono">SKU</th>
                <th class="py-3.5 px-4">Product Name</th>
                <th class="py-3.5 px-4">Category</th>
                <th class="py-3.5 px-4">Brand</th>
                <th class="py-3.5 px-4 text-right">Price</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading catalog items...</td></tr>
              } @else if (filteredProducts.length === 0) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No products found matching criteria.</td></tr>
              } @else {
                @for (prod of filteredProducts; track prod.id) {
                  <tr class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition">
                    <td class="py-3.5 px-4 font-mono font-bold text-[#6C3BFF] dark:text-[#A78BFA] whitespace-nowrap">{{ prod.sku }}</td>
                    <td class="py-3.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {{ prod.name }}
                      @if (prod.description) {
                        <p class="text-[11px] text-[#475569] dark:text-[#94A3B8] font-normal truncate max-w-xs">{{ prod.description }}</p>
                      }
                    </td>
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] text-[#475569] dark:text-[#94A3B8]">
                        {{ prod.category }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-[#475569] dark:text-[#94A3B8] whitespace-nowrap font-medium">
                      {{ prod.brand || 'Enterprise Retail' }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-extrabold text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
                      \${{ (prod.price || 0) | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="prod.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-500 border border-red-500/20'"
                      >
                        {{ prod.status }}
                      </span>
                    </td>
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          (click)="router.navigate(['/products/edit', prod.id])"
                          class="px-3 py-1 text-xs font-semibold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategory = 'ALL';
  selectedStatus = 'ALL';

  get categories(): string[] {
    const set = new Set<string>();
    this.products.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'ALL' || p.category === this.selectedCategory;
      const matchStatus = this.selectedStatus === 'ALL' || p.status === this.selectedStatus;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchCat && matchStatus;
      return matchCat && matchStatus && (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
