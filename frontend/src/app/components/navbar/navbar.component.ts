import { Component, EventEmitter, Output, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 transition-colors duration-200">
      <!-- Left: Mobile Menu Toggle & Brand -->
      <div class="flex items-center gap-1.5 sm:gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <app-icon name="menu" className="w-5 h-5"></app-icon>
        </button>

        <button
          (click)="navigateHome()"
          class="flex items-center gap-2 lg:hidden group cursor-pointer"
        >
          <img src="logo.png" alt="Logo" class="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5" />
          <span class="text-xs font-bold text-slate-900 dark:text-white truncate">Retail ERP</span>
        </button>

        <div class="hidden sm:flex items-center gap-2.5">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
          <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <app-icon name="clock" className="w-3.5 h-3.5 text-slate-400"></app-icon>
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <!-- Center: Quick Search Trigger -->
      <div class="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-6">
        <div
          (click)="onSearchClick()"
          class="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition shadow-2xs"
        >
          <span class="flex items-center gap-2.5 truncate">
            <app-icon name="search" className="w-4 h-4 text-slate-400"></app-icon>
            <span class="hidden sm:inline">Search SKU, orders, modules...</span>
            <span class="sm:hidden">Search...</span>
          </span>
          <kbd class="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400">⌘K</kbd>
        </div>
      </div>

      <!-- Right: Theme Toggle, Bell & User Menu -->
      <div class="flex items-center gap-2 sm:gap-3 relative">
        <!-- Theme Toggle Pill -->
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs group bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-amber-300 dark:border-slate-700/80"
        >
          <div class="w-3.5 h-3.5 flex items-center justify-center">
            @if (themeService.isDark()) {
              <app-icon name="sun" className="w-3.5 h-3.5 text-amber-400"></app-icon>
            } @else {
              <app-icon name="moon" className="w-3.5 h-3.5 text-indigo-600"></app-icon>
            }
          </div>
          <span class="text-xs font-semibold">
            {{ themeService.isDark() ? 'Dark' : 'Light' }}
          </span>
        </button>

        <!-- Notification Bell -->
        <button
          class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition cursor-pointer relative"
          title="Notifications"
        >
          <app-icon name="bell" className="w-4 h-4"></app-icon>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        </button>

        <!-- User Profile Dropdown Trigger -->
        <div class="relative">
          @if (userMenuOpen) {
            <!-- Transparent backdrop to dismiss on click outside -->
            <div (click)="userMenuOpen = false" class="fixed inset-0 z-40 bg-transparent cursor-default"></div>
          }

          <button
            (click)="userMenuOpen = !userMenuOpen"
            class="relative z-50 flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {{ authService.currentUser()?.name || 'User' }}
              </p>
              <p class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                {{ authService.currentUser()?.role || 'OPERATOR' }}
              </p>
            </div>
            <app-icon name="chevron-down" className="w-3.5 h-3.5 text-slate-400 hidden sm:block"></app-icon>
          </button>

          <!-- Dropdown Menu -->
          @if (userMenuOpen) {
            <div class="absolute right-0 top-12 z-50 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2">
              <div class="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p class="text-xs font-bold text-slate-900 dark:text-white">{{ authService.currentUser()?.name }}</p>
                <p class="text-xs text-slate-400 truncate">{{ authService.currentUser()?.email }}</p>
                <div class="mt-2">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    [ngClass]="authService.isAdmin() ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'"
                  >
                    {{ authService.isAdmin() ? 'ADMIN PRIVILEGES' : 'OPERATOR ACCESS' }}
                  </span>
                </div>
              </div>

              <div class="py-1">
                @if (authService.isAdmin()) {
                  <button
                    (click)="goTo('/dashboard?view=admin')"
                    class="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="layout-dashboard" className="w-4 h-4 text-indigo-500"></app-icon>
                    <span>Admin Command Center</span>
                  </button>
                  <button
                    (click)="goTo('/dashboard/user')"
                    class="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="user-check" className="w-4 h-4 text-emerald-500"></app-icon>
                    <span>Operator Workspace</span>
                  </button>
                } @else {
                  <button
                    (click)="goTo('/dashboard')"
                    class="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <app-icon name="layout-dashboard" className="w-4 h-4 text-emerald-500"></app-icon>
                    <span>My Dashboard</span>
                  </button>
                }
              </div>

              <div class="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  (click)="logout()"
                  class="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <app-icon name="log-out" className="w-4 h-4 text-rose-500"></app-icon>
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
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  userMenuOpen = false;
  currentTime = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.userMenuOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.userMenuOpen = false;
  }

  constructor() {
    this.updateClock();
    setInterval(() => this.updateClock(), 30000);
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
    this.router.navigateByUrl(path);
  }

  logout() {
    this.userMenuOpen = false;
    this.authService.logout();
  }
}
