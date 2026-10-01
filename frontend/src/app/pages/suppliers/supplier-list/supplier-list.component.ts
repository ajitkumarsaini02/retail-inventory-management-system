import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { AuthService } from '../../../services/auth.service';
import { Supplier } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">Suppliers Directory</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14B8A6]/10 text-[#0D9488] dark:text-[#2DD4BF] border border-[#14B8A6]/20">
              {{ filteredSuppliers.length }} Verified Partners
            </span>
          </div>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">Manage verified supply vendors, procurement agreements, terms, and primary points of contact</p>
        </div>

        @if (authService.isAdmin()) {
          <button
            (click)="router.navigate(['/suppliers/add'])"
            class="px-4 py-2.5 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-[#6C3BFF]/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-98"
          >
            <app-icon name="plus" className="w-4 h-4"></app-icon>
            <span>Onboard New Supplier</span>
          </button>
        }
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <app-icon name="search" className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by supplier name, contact person, or email..."
            class="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF]"
          />
        </div>

        <select
          [(ngModel)]="selectedStatus"
          class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#6C3BFF] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <!-- Suppliers Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-[#F8FAFC]/90 dark:bg-[#10152A]/90 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0] dark:border-[#252C45]">
              <tr>
                <th class="py-3.5 px-4">Supplier Name</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Phone</th>
                <th class="py-3.5 px-4">Contact Person</th>
                <th class="py-3.5 px-4 text-center">Status</th>
                @if (authService.isAdmin()) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]/70 dark:divide-[#252C45]/70">
              @if (isLoading) {
                <tr><td [colSpan]="authService.isAdmin() ? 6 : 5" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">Loading supplier partners...</td></tr>
              } @else if (filteredSuppliers.length === 0) {
                <tr><td [colSpan]="authService.isAdmin() ? 6 : 5" class="py-12 text-center text-[#94A3B8] dark:text-[#64748B]">No suppliers found matching criteria.</td></tr>
              } @else {
                @for (supp of filteredSuppliers; track supp.id) {
                  <tr class="hover:bg-[#F5F3FF]/60 dark:hover:bg-[#1B2140]/60 transition">
                    <!-- Supplier Name -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-[#14B8A6]/10 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center font-bold text-xs shrink-0 border border-[#14B8A6]/20">
                          <app-icon name="truck" className="w-4 h-4"></app-icon>
                        </div>
                        <div>
                          <div class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ supp.name }}</div>
                          <div class="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Terms: {{ supp.paymentTerms || 'Net 30' }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Email -->
                    <td class="py-3.5 px-4 font-mono text-xs text-[#475569] dark:text-[#94A3B8]">
                      {{ supp.email }}
                    </td>

                    <!-- Phone -->
                    <td class="py-3.5 px-4 font-mono text-[#0F172A] dark:text-[#F8FAFC] whitespace-nowrap">
                      {{ supp.phone }}
                    </td>

                    <!-- Contact Person -->
                    <td class="py-3.5 px-4 text-[#0F172A] dark:text-[#F8FAFC] font-medium whitespace-nowrap">
                      {{ supp.contactPerson }}
                    </td>

                    <!-- Status -->
                    <td class="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="supp.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                          : 'bg-red-500/15 text-red-500 border border-red-500/20'"
                      >
                        {{ supp.status }}
                      </span>
                    </td>

                    <!-- Actions -->
                    @if (authService.isAdmin()) {
                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          (click)="router.navigate(['/suppliers/edit', supp.id])"
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
export class SupplierListComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];
  isLoading = true;
  searchQuery = '';
  selectedStatus = 'ALL';

  get filteredSuppliers(): Supplier[] {
    return this.suppliers.filter(s => {
      const matchSt = this.selectedStatus === 'ALL' || s.status === this.selectedStatus;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchSt;
      return matchSt && (
        s.name.toLowerCase().includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    });
  }

  ngOnInit() {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data || [];
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
