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
        <!-- Form Card (with Logo & Heading inside) -->
        <div class="bg-white dark:bg-[#141A2E] border border-[#E2E8F0] dark:border-[#252C45] rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-colors duration-200">
          <!-- Logo & Branding inside Card -->
          <div class="text-center mb-6">
            <div class="inline-flex p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#10152A] border border-[#E2E8F0] dark:border-[#252C45] shadow-md mb-3 transition-transform hover:scale-105 duration-200">
              <img src="logo.png" alt="Retail Inventory ERP" class="w-11 h-11 object-contain" />
            </div>

            <!-- Badges -->
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#6C3BFF]/10 text-[#6C3BFF] border border-[#6C3BFF]/20">
                ENTERPRISE EDITION
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                HCL Project P_022
              </span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Retail Inventory ERP
            </h2>
            <p class="text-[#475569] dark:text-[#94A3B8] text-xs sm:text-sm mt-1.5 leading-relaxed">
              Enterprise supply chain telemetry, inventory control & sales fulfillment
            </p>
          </div>

          <!-- Secure JWT Authentication Badge -->
          <div class="mb-5 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-[#6C3BFF]/5 dark:bg-[#6C3BFF]/10 border border-[#6C3BFF]/20 text-xs font-semibold text-[#6C3BFF] dark:text-[#A78BFA]">
            <app-icon name="shield-check" className="w-4 h-4 shrink-0"></app-icon>
            <span>Secure JWT Authentication</span>
          </div>

          @if (errorMessage) {
            <div class="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <app-icon name="alert-triangle" className="w-4 h-4 shrink-0 text-red-500"></app-icon>
              <span class="leading-tight">{{ errorMessage }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Work Email -->
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
                  placeholder="admin@retailerp.com"
                  class="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
              </div>
            </div>

            <!-- Password with Show/Hide toggle -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Password
                </label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#64748B]">
                  <app-icon name="lock" className="w-4 h-4"></app-icon>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] dark:bg-[#11172B] border border-[#E2E8F0] dark:border-[#252C45] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] dark:placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/25 focus:border-[#6C3BFF] transition"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer transition"
                  [title]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" className="w-4 h-4"></app-icon>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 text-[#475569] dark:text-[#94A3B8] cursor-pointer select-none">
                <input
                  type="checkbox"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                  class="w-4 h-4 rounded border-[#E2E8F0] dark:border-[#252C45] bg-[#F8FAFC] dark:bg-[#11172B] text-[#6C3BFF] focus:ring-[#6C3BFF]/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                (click)="showForgotPasswordNotice()"
                class="text-[#6C3BFF] hover:text-[#7C4DFF] font-semibold cursor-pointer transition"
              >
                Forgot password?
              </button>
            </div>

            @if (forgotNotice) {
              <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#2563EB] dark:text-blue-300 text-xs">
                {{ forgotNotice }}
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full mt-2 py-3 bg-gradient-to-r from-[#6C3BFF] to-[#7C4DFF] hover:from-[#7C4DFF] hover:to-[#6C3BFF] active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-[#6C3BFF]/25 hover:shadow-lg hover:shadow-[#6C3BFF]/35 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (isLoading) {
                <app-icon name="refresh" className="w-4 h-4 animate-spin"></app-icon>
                <span>Authenticating JWT...</span>
              } @else {
                <span>Sign In to Dashboard</span>
                <app-icon name="arrow-right" className="w-4 h-4"></app-icon>
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#252C45] text-center">
            <p class="text-xs text-[#475569] dark:text-[#94A3B8]">
              Don't have an enterprise account?
              <a routerLink="/register" class="text-[#6C3BFF] hover:text-[#7C4DFF] font-semibold ml-1 cursor-pointer">
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
  rememberMe = true;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  forgotNotice = '';

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  showForgotPasswordNotice() {
    this.forgotNotice = 'Password reset instructions have been forwarded to the system administrator.';
    setTimeout(() => { this.forgotNotice = ''; }, 6000);
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please provide both work email and password.';
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
        this.errorMessage = err.error?.message || 'Invalid email or password. Please verify credentials.';
      }
    });
  }
}
