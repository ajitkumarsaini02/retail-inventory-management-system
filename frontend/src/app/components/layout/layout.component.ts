import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-[#F8FAFC] dark:bg-[#070A1A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      <!-- Sidebar -->
      <app-sidebar [isOpen]="sidebarOpen" (close)="sidebarOpen = false"></app-sidebar>

      <!-- Desktop Sidebar Offset Wrapper -->
      <div class="lg:pl-64 flex flex-col min-h-screen transition-all duration-200">
        <!-- Top Navbar -->
        <app-navbar (toggleSidebar)="sidebarOpen = !sidebarOpen"></app-navbar>

        <!-- Main Content Area with generous distance from side panel and top header -->
        <main class="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-8 xl:px-12 xl:py-10">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  sidebarOpen = false;
}
