import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserStats } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User, Role } from '../../../models';
import { IconComponent } from '../../../components/icon/icon.component';
import { INITIAL_USERS } from '../../../constants/initial-data';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#6C3BFF]/10 text-[#6C3BFF] dark:text-[#38BDF8] border border-[#6C3BFF]/20">
              <span class="w-1.5 h-1.5 rounded-full bg-[#6C3BFF] dark:bg-[#38BDF8] animate-pulse"></span>
              Admin Security Console
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            User Management & RBAC
          </h1>
          <p class="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
            Role-based access control, security policies, and credential status management
          </p>
        </div>

        <button
          (click)="loadUsers()"
          [disabled]="isLoading"
          class="px-4 py-2.5 bg-white dark:bg-[#141A2E] text-slate-700 dark:text-slate-200 border border-[#E2E8F0] dark:border-[#252C45] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <app-icon name="refresh" [className]="'w-4 h-4 ' + (isLoading ? 'animate-spin text-[#6C3BFF]' : '')"></app-icon>
          <span>Refresh Users</span>
        </button>
      </div>

      <!-- Quick Stats KPI Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-4 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Total Users</span>
            <div class="w-7 h-7 rounded-lg bg-[#6C3BFF]/10 text-[#6C3BFF] flex items-center justify-center">
              <app-icon name="users" className="w-3.5 h-3.5"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mt-2 font-mono">
            {{ stats?.totalUsers || users.length }}
          </p>
          <span class="text-[10px] text-slate-400">Registered Accounts</span>
        </div>

        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-4 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Administrators</span>
            <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <app-icon name="shield-check" className="w-3.5 h-3.5"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#6C3BFF] dark:text-[#7C4DFF] mt-2 font-mono">
            {{ stats?.adminCount ?? getRoleCount('ADMIN') }}
          </p>
          <span class="text-[10px] text-slate-400">Full System Privileges</span>
        </div>

        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-4 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Store Operators</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <app-icon name="user-check" className="w-3.5 h-3.5"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#22C55E] mt-2 font-mono">
            {{ stats?.operatorCount ?? getRoleCount('USER') }}
          </p>
          <span class="text-[10px] text-slate-400">Operator Workspace</span>
        </div>

        <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] p-4 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Active Accounts</span>
            <div class="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
              <app-icon name="check-circle" className="w-3.5 h-3.5"></app-icon>
            </div>
          </div>
          <p class="text-2xl font-extrabold text-[#38BDF8] mt-2 font-mono">
            {{ stats?.activeCount ?? getActiveCount() }}
          </p>
          <span class="text-[10px] text-slate-400">Security Clearance Enabled</span>
        </div>
      </div>

      <!-- Search & Filters Strip -->
      <div class="bg-white dark:bg-[#141A2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-2xs flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <app-icon name="search" className="w-4 h-4"></app-icon>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by full name or email address..."
            class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]"
          />
        </div>

        <div class="flex gap-2">
          <select
            [(ngModel)]="roleFilter"
            class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF] cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN Only</option>
            <option value="USER">USER (Operator)</option>
          </select>

          <select
            [(ngModel)]="statusFilter"
            class="px-3 py-2 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6C3BFF] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Suspended</option>
          </select>
        </div>
      </div>

      <!-- User Directory Table -->
      <div class="bg-white dark:bg-[#141A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#252C45] shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr class="border-b border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC]/80 dark:bg-[#10152A]/80 text-[#475569] dark:text-[#94A3B8] font-bold text-[11px] uppercase tracking-wider">
                <th class="py-3.5 px-4 sm:px-6">Name</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Role</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Created At</th>
                <th class="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0] dark:divide-[#252C45] text-[#0F172A] dark:text-[#F8FAFC]">
              @if (isLoading) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <div class="flex items-center justify-center gap-2">
                      <app-icon name="refresh" className="w-5 h-5 animate-spin text-[#6C3BFF]"></app-icon>
                      <span>Loading user credentials...</span>
                    </div>
                  </td>
                </tr>
              } @else if (filteredUsers.length === 0) {
                <tr>
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <app-icon name="users" className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600"></app-icon>
                    <p class="font-semibold">No users matching search filters</p>
                  </td>
                </tr>
              } @else {
                @for (u of filteredUsers; track u.id) {
                  <tr class="hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition-colors">
                    <!-- Name with Avatar -->
                    <td class="py-4 px-4 sm:px-6 font-semibold">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C3BFF] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {{ u.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ u.name }}</p>
                          @if (authService.currentUser()?.email === u.email) {
                            <span class="text-[10px] text-[#6C3BFF] dark:text-[#38BDF8] font-bold uppercase">(You)</span>
                          }
                        </div>
                      </div>
                    </td>

                    <!-- Email -->
                    <td class="py-4 px-4 text-[#475569] dark:text-[#94A3B8] font-mono text-xs">
                      {{ u.email }}
                    </td>

                    <!-- Role Badge -->
                    <td class="py-4 px-4">
                      @if (u.role === 'ADMIN') {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#6C3BFF]/15 text-[#6C3BFF] dark:text-[#7C4DFF] border border-[#6C3BFF]/30">
                          <app-icon name="shield-check" className="w-3 h-3"></app-icon>
                          ADMIN
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                          <app-icon name="user" className="w-3 h-3"></app-icon>
                          USER
                        </span>
                      }
                    </td>

                    <!-- Status -->
                    <td class="py-4 px-4">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="u.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-500/20'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="u.enabled ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                        {{ u.enabled ? 'Active' : 'Suspended' }}
                      </span>
                    </td>

                    <!-- Created At -->
                    <td class="py-4 px-4 text-slate-400 text-xs font-mono">
                      {{ formatDate(u.createdAt) }}
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 sm:px-6 text-right">
                      @if (authService.currentUser()?.email !== u.email) {
                        <button
                          (click)="toggleStatus(u)"
                          [disabled]="isToggling === u.id"
                          class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer"
                          [ngClass]="u.enabled
                            ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'"
                        >
                          @if (isToggling === u.id) {
                            <span>Updating...</span>
                          } @else {
                            <span>{{ u.enabled ? 'Suspend' : 'Activate' }}</span>
                          }
                        </button>
                      } @else {
                        <span class="text-[11px] text-slate-400 italic">Self Account</span>
                      }
                    </td>
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
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [...INITIAL_USERS];
  stats: UserStats | null = {
    totalUsers: INITIAL_USERS.length,
    adminCount: INITIAL_USERS.filter((u) => u.role === 'ADMIN').length,
    operatorCount: INITIAL_USERS.filter((u) => u.role === 'USER').length,
    activeCount: INITIAL_USERS.filter((u) => u.enabled).length
  };
  isLoading = false;
  isToggling: number | null = null;

  searchQuery = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    if (this.users.length === 0) {
      this.isLoading = true;
    }
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });

    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter((u) => {
      const matchesSearch =
        !this.searchQuery ||
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole =
        this.roleFilter === 'ALL' || u.role === this.roleFilter;

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && u.enabled) ||
        (this.statusFilter === 'DISABLED' && !u.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getRoleCount(role: Role): number {
    return this.users.filter((u) => u.role === role).length;
  }

  getActiveCount(): number {
    return this.users.filter((u) => u.enabled).length;
  }

  toggleStatus(user: User) {
    this.isToggling = user.id;
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updated) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updated;
        }
        this.isToggling = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isToggling = null;
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}
