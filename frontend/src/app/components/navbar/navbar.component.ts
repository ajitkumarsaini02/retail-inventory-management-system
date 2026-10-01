import { Component, EventEmitter, Output, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="h-16 bg-white/95 dark:bg-[#10152A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#252C45] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 transition-colors duration-200">
      <!-- Left: Mobile Menu Toggle & Brand -->
      <div class="flex items-center gap-1.5 sm:gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
        >
          <app-icon name="menu" className="w-5 h-5"></app-icon>
        </button>

        <button
          (click)="navigateHome()"
          class="flex items-center gap-2 lg:hidden group cursor-pointer"
        >
          <img src="logo.png" alt="Logo" class="w-8 h-8 rounded-lg object-contain bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] p-0.5" />
          <span class="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">Retail ERP</span>
        </button>

        <div class="hidden sm:flex items-center gap-2.5">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            <span class="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
          <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
            <app-icon name="clock" className="w-3.5 h-3.5 text-slate-400"></app-icon>
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Center: Quick Search Trigger -->
      <div class="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-6">
        <div
          (click)="onSearchClick()"
          class="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-slate-400 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl cursor-pointer hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition shadow-2xs"
        >
          <span class="flex items-center gap-2.5 truncate">
            <app-icon name="search" className="w-4 h-4 text-slate-400"></app-icon>
            <span class="hidden sm:inline">Search SKU, orders, modules...</span>
            <span class="sm:hidden">Search...</span>
          </span>
          <kbd class="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-lg text-slate-400">⌘K</kbd>
        </div>
      </div>

      <!-- Right: Theme Toggle, Bell & User Menu -->
      <div class="flex items-center gap-2 sm:gap-3 relative">
        <!-- Theme Toggle Pill -->
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs group bg-[#F8FAFC] hover:bg-[#F5F3FF] text-[#0F172A] border-[#E2E8F0] dark:bg-[#141A2E] dark:hover:bg-[#1B2140] dark:text-[#F59E0B] dark:border-[#252C45]"
        >
          <div class="w-3.5 h-3.5 flex items-center justify-center">
            @if (themeService.isDark()) {
              <app-icon name="sun" className="w-3.5 h-3.5 text-[#F59E0B]"></app-icon>
            } @else {
              <app-icon name="moon" className="w-3.5 h-3.5 text-[#6C3BFF]"></app-icon>
            }
          </div>
          <span class="text-xs font-semibold">
            {{ themeService.isDark() ? 'Dark' : 'Light' }}
          </span>
        </button>

        <!-- Notification Bell Dropdown -->
        <div class="relative">
          @if (notifMenuOpen) {
            <div (click)="notifMenuOpen = false" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
          }

          <button
            (click)="toggleNotifications()"
            [title]="'Notifications (' + notifService.unreadCount() + ' unread)'"
            class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer relative"
          >
            <app-icon name="bell" className="w-4 h-4"></app-icon>
            @if (notifService.unreadCount() > 0) {
              <span class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#6C3BFF] text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notification Panel -->
          @if (notifMenuOpen) {
            <div class="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white dark:bg-[#141A2E] rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-[#252C45] overflow-hidden flex flex-col max-h-[85vh]">
              <!-- Header -->
              <div class="p-3.5 sm:p-4 border-b border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC]/80 dark:bg-[#11172B]/80 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 rounded-lg bg-[#6C3BFF]/10 text-[#6C3BFF]">
                    <app-icon name="bell" className="w-4 h-4"></app-icon>
                  </div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Live ERP Alerts</h3>
                    <p class="text-[10px] text-slate-400">
                      {{ notifService.unreadCount() }} unread alert{{ notifService.unreadCount() === 1 ? '' : 's' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  @if (notifService.unreadCount() > 0) {
                    <button
                      (click)="markAllAsRead()"
                      class="px-2 py-1 text-[11px] font-semibold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Mark all as read"
                    >
                      <app-icon name="check-check" className="w-3.5 h-3.5"></app-icon>
                      <span class="hidden sm:inline">Mark read</span>
                    </button>
                  }
                  <button
                    (click)="refreshNotifications()"
                    class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1B2140] rounded-lg transition cursor-pointer"
                    [class.animate-spin]="notifService.isLoading()"
                    title="Refresh alerts"
                  >
                    <app-icon name="refresh" className="w-3.5 h-3.5"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Filter Tabs -->
              <div class="flex items-center gap-1 px-3 py-2 border-b border-[#E2E8F0] dark:border-[#252C45] bg-white dark:bg-[#141A2E] text-[11px] font-semibold">
                <button
                  (click)="filterType = 'all'"
                  [class]="filterType === 'all' ? 'bg-[#6C3BFF] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1B2140] dark:text-slate-400'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  All ({{ notifService.notifications().length }})
                </button>
                <button
                  (click)="filterType = 'stock'"
                  [class]="filterType === 'stock' ? 'bg-[#6C3BFF] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1B2140] dark:text-slate-400'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Stock Alerts
                </button>
                <button
                  (click)="filterType = 'order'"
                  [class]="filterType === 'order' ? 'bg-[#6C3BFF] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1B2140] dark:text-slate-400'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Orders
                </button>
              </div>

              <!-- Items List -->
              <div class="overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#252C45] max-h-72">
                @for (item of filteredNotifications; track item.id) {
                  <div
                    (click)="onNotificationClick(item)"
                    class="p-3 sm:p-3.5 flex items-start gap-3 hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer relative group"
                    [class.bg-[#6C3BFF]/5]="!item.read"
                  >
                    <!-- Severity Icon Badge -->
                    <div
                      class="mt-0.5 p-2 rounded-xl shrink-0 flex items-center justify-center"
                      [ngClass]="{
                        'bg-rose-500/10 text-rose-500': item.severity === 'critical',
                        'bg-amber-500/10 text-amber-500': item.severity === 'warning',
                        'bg-blue-500/10 text-blue-500': item.severity === 'info',
                        'bg-emerald-500/10 text-emerald-500': item.severity === 'success'
                      }"
                    >
                      @if (item.type === 'stock') {
                        <app-icon name="alert-triangle" className="w-4 h-4"></app-icon>
                      } @else if (item.type === 'order') {
                        <app-icon name="shopping-cart" className="w-4 h-4"></app-icon>
                      } @else if (item.type === 'po') {
                        <app-icon name="truck" className="w-4 h-4"></app-icon>
                      } @else {
                        <app-icon name="check-circle" className="w-4 h-4"></app-icon>
                      }
                    </div>

                    <!-- Notification Body -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-1 mb-0.5">
                        <p class="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                          {{ item.title }}
                        </p>
                        @if (!item.read) {
                          <span class="w-2 h-2 rounded-full bg-[#6C3BFF] shrink-0"></span>
                        }
                      </div>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {{ item.message }}
                      </p>
                      <div class="flex items-center gap-2 mt-1.5">
                        <span class="text-[10px] font-semibold text-slate-400">{{ item.time }}</span>
                        <span class="text-slate-300 dark:text-slate-600">•</span>
                        <span class="text-[10px] font-bold text-[#6C3BFF] group-hover:underline">View Details →</span>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="p-8 text-center">
                    <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-[#1B2140] flex items-center justify-center text-slate-400">
                      <app-icon name="check-circle" className="w-5 h-5 text-[#22C55E]"></app-icon>
                    </div>
                    <p class="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No alerts in this category</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Everything is up to date and healthy.</p>
                  </div>
                }
              </div>

              <!-- Footer Action -->
              <div class="p-2.5 border-t border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-center">
                <button
                  (click)="goToInventory()"
                  class="text-xs font-bold text-[#6C3BFF] hover:text-[#5827e8] transition cursor-pointer"
                >
                  Manage Real-Time Stock Inventory &rarr;
                </button>
              </div>
            </div>
          }
        </div>

        <!-- User Profile Dropdown Trigger -->
        <div class="relative">
          @if (userMenuOpen) {
            <!-- Transparent backdrop to dismiss on click outside -->
            <div (click)="userMenuOpen = false" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
          }

          <button
            (click)="userMenuOpen = !userMenuOpen"
            class="relative z-50 flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] transition cursor-pointer"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6C3BFF] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
                {{ authService.currentUser()?.name || 'Ajit Kumar' }}
              </p>
              <p class="text-[10px] font-semibold text-[#6C3BFF] dark:text-[#38BDF8] uppercase">
                {{ authService.currentUser()?.role || 'ADMIN' }}
              </p>
            </div>
            <app-icon name="chevron-down" className="w-3.5 h-3.5 text-slate-400 hidden sm:block"></app-icon>
          </button>

          <!-- Dropdown Menu -->
          @if (userMenuOpen) {
            <div class="absolute right-0 top-12 z-50 w-64 bg-white dark:bg-[#141A2E] rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-[#252C45] py-2">
              <div class="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#252C45]">
                <p class="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">{{ authService.currentUser()?.name || 'Ajit Kumar' }}</p>
                <p class="text-xs text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
                <div class="mt-2">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    [ngClass]="authService.isAdmin() ? 'bg-[#6C3BFF]/15 text-[#6C3BFF] dark:text-[#7C4DFF]' : 'bg-[#22C55E]/15 text-[#22C55E]'"
                  >
                    {{ authService.isAdmin() ? 'ADMIN PRIVILEGES' : 'OPERATOR ACCESS' }}
                  </span>
                </div>
              </div>

              <div class="py-1">
                @if (authService.isAdmin()) {
                  <button
                    (click)="goTo('/dashboard?view=admin')"
                    class="w-full text-left px-4 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="layout-dashboard" className="w-4 h-4 text-[#6C3BFF]"></app-icon>
                    <span>Admin Command Center</span>
                  </button>
                  <button
                    (click)="goTo('/users')"
                    class="w-full text-left px-4 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="users" className="w-4 h-4 text-[#38BDF8]"></app-icon>
                    <span>User Management</span>
                  </button>
                  <button
                    (click)="goTo('/dashboard/user')"
                    class="w-full text-left px-4 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="user-check" className="w-4 h-4 text-[#22C55E]"></app-icon>
                    <span>Operator Workspace</span>
                  </button>
                } @else {
                  <button
                    (click)="goTo('/dashboard')"
                    class="w-full text-left px-4 py-2 text-xs text-[#475569] dark:text-[#94A3B8] hover:bg-[#F5F3FF] dark:hover:bg-[#1B2140] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="layout-dashboard" className="w-4 h-4 text-[#22C55E]"></app-icon>
                    <span>My Dashboard</span>
                  </button>
                }
              </div>

              <div class="border-t border-[#E2E8F0] dark:border-[#252C45] pt-1">
                <button
                  (click)="logout()"
                  class="w-full text-left px-4 py-2 text-xs text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <app-icon name="log-out" className="w-4 h-4 text-[#EF4444]"></app-icon>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  notifService = inject(NotificationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  userMenuOpen = false;
  notifMenuOpen = false;
  filterType: 'all' | 'stock' | 'order' = 'all';
  currentTime = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen = false;
      this.notifMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.userMenuOpen = false;
    this.notifMenuOpen = false;
  }

  constructor() {
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
  }

  get filteredNotifications(): AppNotification[] {
    const list = this.notifService.notifications();
    if (this.filterType === 'all') return list;
    if (this.filterType === 'stock') return list.filter((n) => n.type === 'stock');
    if (this.filterType === 'order') return list.filter((n) => n.type === 'order' || n.type === 'po');
    return list;
  }

  toggleNotifications() {
    this.notifMenuOpen = !this.notifMenuOpen;
    if (this.notifMenuOpen) {
      this.userMenuOpen = false;
      this.notifService.refresh();
    }
  }

  onNotificationClick(item: AppNotification) {
    this.notifService.markAsRead(item.id);
    this.notifMenuOpen = false;
    this.router.navigateByUrl(item.link);
  }

  markAllAsRead() {
    this.notifService.markAllAsRead();
  }

  refreshNotifications() {
    this.notifService.refresh();
  }

  goToInventory() {
    this.notifMenuOpen = false;
    this.router.navigateByUrl('/inventory');
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  navigateHome() {
    this.router.navigate(['/dashboard']);
  }

  onSearchClick() {
    this.router.navigate(['/products']);
  }

  goTo(path: string) {
    this.userMenuOpen = false;
    this.notifMenuOpen = false;
    this.router.navigateByUrl(path);
  }

  logout() {
    this.userMenuOpen = false;
    this.notifMenuOpen = false;
    this.authService.logout();
  }
}
