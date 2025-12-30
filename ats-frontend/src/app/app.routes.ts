import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/client-list/client-list.component').then(m => m.ClientListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./pages/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/job-list/job-list.component').then(m => m.JobListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs/:id/kanban',
    loadComponent: () => import('./pages/kanban/kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'candidates',
    loadComponent: () => import('./pages/candidates/candidate-list/candidate-list.component').then(m => m.CandidateListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'candidates/:id',
    loadComponent: () => import('./pages/candidates/candidate-detail/candidate-detail.component').then(m => m.CandidateDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'administration',
    loadComponent: () => import('./pages/administration/administration.component').then(m => m.AdministrationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'email-templates',
    loadComponent: () => import('./pages/email-templates/email-templates.component').then(m => m.EmailTemplatesComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
