import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 relative overflow-hidden transition-colors duration-200">
      <!-- Ambient Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Right Floating Theme Switcher -->
      <div class="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs backdrop-blur-md group"
          [ngClass]="themeService.isDark()
            ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-slate-700'
            : 'bg-white/90 hover:bg-slate-100 text-slate-800 border-slate-200'"
        >
          <div class="w-4 h-4 flex items-center justify-center transition-transform group-hover:scale-110">
            @if (themeService.isDark()) {
              <app-icon name="sun" className="w-4 h-4 text-amber-400"></app-icon>
            } @else {
              <app-icon name="moon" className="w-4 h-4 text-indigo-600"></app-icon>
            }
          </div>
          <span class="text-xs font-semibold">
            {{ themeService.isDark() ? 'Dark' : 'Light' }}
          </span>
        </button>
      </div>

      <div class="w-full max-w-[430px] relative z-10">
        <!-- Form Card (with Logo & Heading inside) -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-200">
          <!-- Logo & Branding inside Card -->
          <div class="text-center mb-6">
            <div class="inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md mb-3 transition-transform hover:scale-105 duration-200">
              <img src="logo.png" alt="Retail ERP" class="w-11 h-11 object-contain" />
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign In to Retail ERP
            </h2>
            <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Access inventory telemetry, procurement & sales fulfillment
            </p>
          </div>

          @if (errorMessage) {
            <div class="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <app-icon name="alert-triangle" className="w-4 h-4 shrink-0 text-rose-500"></app-icon>
              <span class="leading-tight">{{ errorMessage }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Work Email -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <app-icon name="mail" className="w-4 h-4"></app-icon>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>
            </div>

            <!-- Password with Show/Hide toggle -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <app-icon name="lock" className="w-4 h-4"></app-icon>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-800 transition"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
                  [title]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" className="w-4 h-4"></app-icon>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isLoading) {
                <app-icon name="refresh" className="w-4 h-4 animate-spin"></app-icon>
                <span>Signing In...</span>
              } @else {
                <span>Sign In to Dashboard</span>
                <app-icon name="arrow-right" className="w-4 h-4"></app-icon>
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?
              <a routerLink="/register" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold ml-1 cursor-pointer">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both email and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
      }
    });
  }
}
