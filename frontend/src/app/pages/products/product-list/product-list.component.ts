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
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Product Catalog</h1>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Manage retail SKUs, pricing, categories, and reorder levels</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/products/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Add New Product</span>
          </button>
        }
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by product name, SKU, or category..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <select
          [(ngModel)]="selectedCategory"
          class="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          @for (cat of categories; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      </div>

      <!-- Products Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4">Product Name</th>
                <th class="py-3.5 px-4">SKU</th>
                <th class="py-3.5 px-4">Category</th>
                <th class="py-3.5 px-4 text-right">Retail Price</th>
                <th class="py-3.5 px-4 text-right">Unit Cost</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @if (isLoading) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-slate-400">Loading catalog items...</td></tr>
              } @else if (filteredProducts.length === 0) {
                <tr><td [colSpan]="authService.isAdmin() ? 7 : 6" class="py-12 text-center text-slate-400">No products found.</td></tr>
              } @else {
                @for (prod of filteredProducts; track prod.id) {
                  <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{{ prod.name }}</td>
                    <td class="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ prod.sku }}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {{ prod.category }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      \${{ (prod.price || 0) | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono text-slate-500">
                      \${{ (prod.costPrice || prod.unitCost || 0) | number:'1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="prod.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                      >
                        {{ prod.status }}
                      </span>
                    </td>
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 text-right">
                        <button
                          (click)="router.navigate(['/products/edit', prod.id])"
                          class="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
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

  get categories(): string[] {
    const set = new Set<string>();
    this.products.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchCat = this.selectedCategory === 'ALL' || p.category === this.selectedCategory;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchCat;
      return matchCat && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
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
