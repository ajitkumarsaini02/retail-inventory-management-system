import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { IconComponent } from '../../../components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, UserDashboardComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Admin Preview Banner when inspecting Operator view -->
      @if (authService.isAdmin() && activeView === 'user') {
        <div class="bg-indigo-900/90 text-white px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-indigo-700/60 animate-in fade-in">
          <div class="flex items-center gap-2.5 text-xs sm:text-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="font-semibold text-indigo-100 flex items-center gap-1.5">
              <app-icon name="user-check" className="w-4 h-4 text-emerald-400"></app-icon>
              Previewing Operator Workspace: You are viewing the interface as store associates see it.
            </span>
          </div>
          <button
            (click)="switchToAdminView()"
            class="px-3.5 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <app-icon name="shield-check" className="w-3.5 h-3.5 text-indigo-600"></app-icon>
            <span>Return to Admin Command Center</span>
          </button>
        </div>
      }

      <!-- Render Selected Dashboard -->
      @if (authService.isAdmin() && activeView === 'admin') {
        <app-admin-dashboard (switchToUserView)="switchToUserView()"></app-admin-dashboard>
      } @else {
        <app-user-dashboard></app-user-dashboard>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeView: 'admin' | 'user' = 'admin';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (!this.authService.isAdmin()) {
        this.activeView = 'user';
      } else if (params['view'] === 'user') {
        this.activeView = 'user';
      } else {
        this.activeView = 'admin';
      }
    });
  }

  switchToUserView() {
    this.activeView = 'user';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'user' },
      queryParamsHandling: 'merge'
    });
  }

  switchToAdminView() {
    this.activeView = 'admin';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'admin' },
      queryParamsHandling: 'merge'
    });
  }
}
