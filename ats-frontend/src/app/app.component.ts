import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SidebarService } from './services/sidebar.service';
import { HeaderComponent } from './components/layout/header/header.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <app-toast></app-toast>
      <!-- Header -->
      <app-header *ngIf="isLoggedIn()"></app-header>

      <div class="flex flex-1" [class.pt-16]="isLoggedIn()">
        <!-- Sidebar -->
        <aside *ngIf="isLoggedIn()" 
               class="fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-gray-200 bg-white shadow-sm"
               [class.w-64]="!isCollapsed()"
               [class.w-20]="isCollapsed()">
          
          <div class="h-full flex flex-col pt-2 overflow-hidden">
            <!-- Logo Section -->
            <div class="mb-4 px-4 flex items-center h-15 overflow-hidden whitespace-nowrap border-b border-gray-50 ml-2">
              <img src="/logo-horizontal.png" alt="RecruitBrain" class="h-14 w-auto transition-all duration-300"
                   [class.scale-75]="isCollapsed()"
                   [class.mx-auto]="isCollapsed()">
            </div>

            <!-- Navigation -->
            <ul class="space-y-1.5 font-medium flex-1 px-3">
              <li *ngFor="let item of navItems">
                <a [routerLink]="item.path" 
                   routerLinkActive="bg-primary-50 text-primary-600 shadow-sm" 
                   class="flex items-center h-11 px-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all group overflow-hidden"
                   [title]="isCollapsed() ? item.label : ''">
                  <span class="w-8 h-8 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    <i [class]="item.icon"></i>
                  </span>
                  <span class="ml-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        [class.opacity-0]="isCollapsed()"
                        [class.translate-x-4]="isCollapsed()">
                    {{ item.label }}
                  </span>
                </a>
              </li>

              <!-- Divider -->
              <div class="my-4 mx-4 border-t border-gray-100 transition-all duration-300" [class.mx-2]="isCollapsed()"></div>
              
              <div class="px-5 mb-2 transition-opacity duration-300" [class.opacity-0]="isCollapsed()">
                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Administration</p>
              </div>

              <li *ngIf="isAdmin()">
                <a routerLink="/administration" 
                   routerLinkActive="bg-primary-50 text-primary-600 shadow-sm"
                   class="flex items-center h-11 px-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all group overflow-hidden"
                   [title]="isCollapsed() ? 'Maintenance' : ''">
                  <span class="w-8 h-8 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    <i class="bi bi-shield-lock"></i>
                  </span>
                  <span class="ml-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        [class.opacity-0]="isCollapsed()"
                        [class.translate-x-4]="isCollapsed()">
                    Maintenance
                  </span>
                </a>
              </li>
              <li *ngIf="isAdmin()">
                <a routerLink="/settings" 
                   routerLinkActive="bg-primary-50 text-primary-600 shadow-sm"
                   class="flex items-center h-11 px-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all group overflow-hidden"
                   [title]="isCollapsed() ? 'Settings' : ''">
                  <span class="w-8 h-8 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    <i class="bi bi-gear"></i>
                  </span>
                  <span class="ml-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        [class.opacity-0]="isCollapsed()"
                        [class.translate-x-4]="isCollapsed()">
                    Settings
                  </span>
                </a>
              </li>
              <li *ngIf="isAdmin()">
                <a routerLink="/email-templates" 
                   routerLinkActive="bg-primary-50 text-primary-600 shadow-sm"
                   class="flex items-center h-11 px-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all group overflow-hidden"
                   [title]="isCollapsed() ? 'Email Templates' : ''">
                  <span class="w-8 h-8 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    <i class="bi bi-envelope-paper"></i>
                  </span>
                  <span class="ml-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap"
                        [class.opacity-0]="isCollapsed()"
                        [class.translate-x-4]="isCollapsed()">
                    Email Templates
                  </span>
                </a>
              </li>
            </ul>

            <!-- Bottom Section (Optional stats or help) -->
            <div class="p-4 transition-opacity duration-300" [class.opacity-0]="isCollapsed()">
                <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p class="text-[10px] text-gray-500 font-medium">SYSTEM STATUS</p>
                    <div class="flex items-center mt-1">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                        <span class="text-xs font-bold text-gray-700 uppercase">Operational</span>
                    </div>
                </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 transition-all duration-300 ease-in-out" 
              [class.pl-64]="isLoggedIn() && !isCollapsed()"
              [class.pl-20]="isLoggedIn() && isCollapsed()">
          <div class="p-2 max-w-screen-2xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AppComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-grid-1x2' },
    { path: '/clients', label: 'Clients', icon: 'bi bi-building' },
    { path: '/jobs', label: 'Jobs', icon: 'bi bi-briefcase' },
    { path: '/candidates', label: 'Candidates', icon: 'bi bi-people' },
    { path: '/analytics', label: 'Analytics', icon: 'bi bi-bar-chart-line' }
  ];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isCollapsed(): boolean {
    return this.sidebarService.isCollapsed;
  }

  get currentUser(): any {
    return this.authService.getUser();
  }

  isAdmin(): boolean {
    const user = this.currentUser;
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }
}
