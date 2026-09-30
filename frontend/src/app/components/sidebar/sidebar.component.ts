import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen) {
      <div
        (click)="close.emit()"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
      ></div>
    }

    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 dark:bg-[#0c0e1e] border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-xl"
      [ngClass]="isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
    >
      <!-- Brand Header -->
      <div class="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 dark:bg-[#0c0e1e]">
        <div (click)="onLogoClick()" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <app-icon name="boxes" className="w-5 h-5 text-indigo-400"></app-icon>
          </div>
          <div>
            <h1 class="text-sm font-extrabold text-white tracking-tight leading-none">
              Retail Inventory ERP
            </h1>
            <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mt-1">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Enterprise Edition
            </span>
          </div>
        </div>

        <button
          (click)="close.emit()"
          class="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <app-icon name="x" className="w-5 h-5"></app-icon>
        </button>
      </div>

      <!-- Quick Action: Create Order -->
      <div class="p-4 pb-1">
        <button
          (click)="navigateAndClose('/orders/add')"
          class="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition cursor-pointer"
        >
          <app-icon name="plus" className="w-4 h-4"></app-icon>
          <span>Create New Order</span>
        </button>
      </div>

      <!-- Nav Links -->
      <div class="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        <!-- Logistics & Catalog -->
        <div>
          <p class="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
            Logistics & Catalog
          </p>
          <nav class="space-y-1">
            <a
              routerLink="/dashboard"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="layout-dashboard" className="w-4 h-4"></app-icon>
              <span>Executive Dashboard</span>
            </a>

            <a
              routerLink="/products"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="package" className="w-4 h-4"></app-icon>
              <span>Product Catalog</span>
            </a>

            <a
              routerLink="/inventory"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="boxes" className="w-4 h-4"></app-icon>
              <span>Inventory Levels</span>
            </a>

            <a
              routerLink="/warehouses"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="warehouse" className="w-4 h-4"></app-icon>
              <span>Warehouses</span>
            </a>
          </nav>
        </div>

        <!-- Sales & CRM -->
        <div>
          <p class="px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
            Sales & CRM
          </p>
          <nav class="space-y-1">
            <a
              routerLink="/orders"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="shopping-cart" className="w-4 h-4"></app-icon>
              <span>Customer Orders</span>
            </a>

            <a
              routerLink="/customers"
              routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
              (click)="close.emit()"
              class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <app-icon name="users" className="w-4 h-4"></app-icon>
              <span>Customers</span>
            </a>
          </nav>
        </div>

        <!-- Admin Supply Chain (Admin Only) -->
        @if (authService.isAdmin()) {
          <div>
            <div class="px-3 flex items-center justify-between mb-2">
              <p class="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                Supply Chain (Admin)
              </p>
              <app-icon name="shield-check" className="w-3.5 h-3.5 text-indigo-400"></app-icon>
            </div>
            <nav class="space-y-1">
              <a
                routerLink="/suppliers"
                routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                (click)="close.emit()"
                class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <app-icon name="truck" className="w-4 h-4"></app-icon>
                <span>Suppliers Directory</span>
              </a>

              <a
                routerLink="/purchase-orders"
                routerLinkActive="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                (click)="close.emit()"
                class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <app-icon name="file-spreadsheet" className="w-4 h-4"></app-icon>
                <span>Purchase Orders</span>
              </a>
            </nav>
          </div>
        }
      </div>

      <!-- Footer: Sign Out -->
      <div class="p-3.5 border-t border-slate-800 bg-slate-900/60">
        <button
          (click)="logout()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
        >
          <app-icon name="log-out" className="w-4 h-4"></app-icon>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  authService = inject(AuthService);
  private router = inject(Router);

  onLogoClick() {
    this.close.emit();
    this.router.navigate(['/dashboard']);
  }

  navigateAndClose(path: string) {
    this.close.emit();
    this.router.navigateByUrl(path);
  }

  logout() {
    this.close.emit();
    this.authService.logout();
  }
}
