import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SidebarService } from '../../../services/sidebar.service';
import { GlobalSearchComponent } from '../../shared/global-search/global-search.component';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchComponent, AvatarComponent],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 z-[50] flex items-center justify-between px-4 lg:px-6 shadow-sm transition-all duration-300"
            [class.left-0]="!isLoggedIn()"
            [class.left-64]="isLoggedIn() && !isCollapsed()"
            [class.left-20]="isLoggedIn() && isCollapsed()">
      
      <!-- Left: Toggle & Branding -->
      <div class="flex items-center gap-1">
        <button 
          *ngIf="isLoggedIn()"
          (click)="toggleSidebar()"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600 transition-colors"
          title="Toggle Sidebar"
        >
          <i class="bi bi-list text-xl"></i>
        </button>
        
        <div class="flex items-center  overflow-hidden whitespace-nowrap">
          <h5 class="text-sm font-bold text-gray-600">Intelligent Tracking That Drives Confident Hires</h5>
        </div>
      </div>

      <!-- Center: Global Search -->
      <div class="flex-1 max-w-2xl px-4">
        <app-global-search></app-global-search>
      </div>

      <!-- Right: User Profile -->
      <div class="flex items-center gap-4 justify-end">
        <div class="hidden md:block text-right">
          <p class="text-sm font-semibold text-gray-900 leading-tight">{{ currentUser?.username }}</p>
          <p class="text-xs text-gray-500">{{ isAdmin() ? 'Administrator' : 'Recruiter' }}</p>
        </div>
        
        <div class="relative group">
          <div class="cursor-pointer">
            <app-avatar 
              [name]="currentUser?.username || 'User'" 
              [imageUrl]="currentUser?.profilePictureUrl"
              [size]="40" 
              type="user">
            </app-avatar>
          </div>
          
          <!-- Dropdown -->
          <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top-right">
            <div class="px-4 py-2 border-b border-gray-50 block md:hidden">
                <p class="text-sm font-semibold text-gray-900">{{ currentUser?.username }}</p>
                <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
            </div>
            <a routerLink="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-semibold tracking-tight uppercase">
              <i class="bi bi-gear me-2"></i> Settings
            </a>
            <button (click)="logout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold tracking-tight uppercase">
              <i class="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HeaderComponent {
  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  get currentUser() {
    return this.authService.getUser();
  }

  isAdmin() {
    return this.currentUser?.roles?.includes('ROLE_ADMIN');
  }

  logout() {
    this.authService.logout();
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  isCollapsed() {
    return this.sidebarService.isCollapsed;
  }
}
