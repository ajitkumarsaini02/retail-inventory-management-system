import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#070A1A] px-4 py-8 relative overflow-hidden transition-colors duration-200">
      <!-- Ambient Glows -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#6C3BFF]/10 dark:bg-[#6C3BFF]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#2563EB]/10 dark:bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Right Floating Theme Switcher -->
      <div class="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        <button
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs backdrop-blur-md group"
          [ngClass]="themeService.isDark()
            ? 'bg-[#10152A]/90 hover:bg-[#1B2140] text-amber-300 border-[#252C45]'
            : 'bg-white/90 hover:bg-[#F5F3FF] text-[#0F172A] border-[#E2E8F0]'"
        >
          <div class="w-4 h-4 flex items-center justify-center transition-transform group-hover:scale-110">
            @if (themeService.isDark()) {
              <app-icon name="sun" className="w-4 h-4 text-amber-400"></app-icon>
            } @else {
              <app-icon name="moon" className="w-4 h-4 text-[#6C3BFF]"></app-icon>
            }
          </div>
          <span class="text-xs font-semibold">
            {{ themeService.isDark() ? 'Dark' : 'Light' }}
          </span>
        </button>
      </div>

      <div class="w-full max-w-[440px] relative z-10">
        <!-- Form Card -->
        <div class="bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-200">
          <!-- Logo & Branding -->
          <div class="text-center mb-6">
            <div class="inline-flex p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#10152A] border border-[#E2E8F0] dark:border-[#252C45] shadow-md mb-3 transition-transform hover:scale-105 duration-200">
              <img src="logo.png" alt="Retail ERP" class="w-11 h-11 object-contain" />
            </div>

            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Create ERP Account
            </h2>
            <p class="text-[#475569] dark:text-[#94A3B8] text-xs sm:text-sm mt-1.5 leading-relaxed">
              First user registered automatically receives full ADMIN privileges
            </p>
          </div>

          @if (errorMessage) {
            <div class="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <app-icon name="alert-triangle" className="w-4 h-4 shrink-0 text-red-500"></app-icon>
              <span class="leading-tight">{{ errorMessage }}</span>
            </div>
          }

          @if (successMessage) {
            <div class="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <app-icon name="check-circle" className="w-4 h-4 shrink-0 text-emerald-500"></app-icon>
              <span class="leading-tight">{{ successMessage }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                Full Name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#64748B]">
                  <app-icon name="user" className="w-4 h-4"></app-icon>
                </div>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  required
                  placeholder="Ajit Kumar"
                  class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
              </div>
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                Work Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#64748B]">
                  <app-icon name="mail" className="w-4 h-4"></app-icon>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="ajit@retailerp.com"
                  class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#64748B]">
                  <app-icon name="lock" className="w-4 h-4"></app-icon>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  class="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition"
                >
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" className="w-4 h-4"></app-icon>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                Confirm Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#64748B]">
                  <app-icon name="lock" className="w-4 h-4"></app-icon>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Confirm password"
                  class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full mt-2 py-3 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-[#6C3BFF]/25 hover:shadow-lg hover:shadow-[#6C3BFF]/35 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isLoading) {
                <app-icon name="refresh" className="w-4 h-4 animate-spin"></app-icon>
                <span>Creating Account...</span>
              } @else {
                <span>Register ERP Account</span>
                <app-icon name="arrow-right" className="w-4 h-4"></app-icon>
              }
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#252C45] text-center">
            <p class="text-xs text-[#475569] dark:text-[#94A3B8]">
              Already have an account?
              <a routerLink="/login" class="text-[#6C3BFF] hover:text-[#7C4DFF] font-semibold ml-1 cursor-pointer">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create account. Please try again.';
      }
    });
  }
}
