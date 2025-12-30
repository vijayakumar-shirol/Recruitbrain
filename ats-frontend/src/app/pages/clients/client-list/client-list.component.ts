import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LocationInputComponent } from '../../../components/shared/location-input/location-input.component';
import { ClientService } from '../../../services/client.service';
import { ToastService } from '../../../services/toast.service';
import { Client } from '../../../models/client.model';
import { SearchBarComponent } from '../../../components/shared/search-bar/search-bar.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchBarComponent, LocationInputComponent, HasRoleDirective, AvatarComponent, TagListComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">Clients</h1>
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto p-1">
             <app-search-bar 
                class="w-full md:w-64" 
                placeholder="Search clients..." 
                (search)="onSearch($event)">
            </app-search-bar>
            <button *appHasRole="['ROLE_ADMIN', 'ROLE_RECRUITER']" (click)="showAddModal = true" class="btn-primary whitespace-nowrap">
              <i class="bi bi-plus-lg me-1"></i> Add Client
            </button>
        </div>
      </div>

      <!-- Client Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let client of filteredClients" class="client-card card-hover">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-semibold">
                <a [routerLink]="['/clients', client.id]" class="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                  {{ client.name }}
                </a>
              </h3>
              <p class="text-sm text-gray-600">{{ client.industry }}</p>
            </div>
            <span class="status-badge" [class.active]="client.status === 'ACTIVE'" 
                  [class.prospect]="client.status === 'PROSPECT'"
                  [class.inactive]="client.status === 'INACTIVE'">
              {{ client.status }}
            </span>
            <app-avatar 
                [name]="client.name" 
                [imageUrl]="client.logoUrl" 
                [size]="48" 
                type="client">
              </app-avatar>
          </div>

          <div class="client-details">
            <p class="text-sm text-gray-700 flex items-center">
              <i class="bi bi-person me-2 text-gray-400"></i>
              <span class="font-medium mr-1">Contact:</span> {{ client.contactPerson }}
            </p>
            <p class="text-sm text-gray-700 flex items-center">
              <i class="bi bi-envelope me-2 text-gray-400"></i>
              <span class="font-medium mr-1">Email:</span> {{ client.email }}
            </p>
            <p class="text-sm text-gray-700 flex items-center">
              <i class="bi bi-telephone me-2 text-gray-400"></i>
              <span class="font-medium mr-1">Phone:</span> {{ client.phone }}
            </p>
          </div>

          <div class="mt-3 flex items-center gap-1">
            <app-tag-list [tags]="client.tags || []" [editable]="false"></app-tag-list>
          </div>

          <div class="mt-4 flex gap-2">
            <a [routerLink]="['/clients', client.id]" class="btn-secondary flex-1">
              View Details
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredClients.length === 0" class="empty-state">
        <p class="text-gray-500">No clients found matching your search.</p>
        <button (click)="onSearch('')" class="text-indigo-600 hover:underline mt-2">Clear search</button>
      </div>

      <!-- Add Client Modal -->
      <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal = false">
        <div class="modal-content !max-w-2xl" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-6">Add New Client</h2>
          <form (ngSubmit)="addClient()">
            
            <!-- Organization Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group col-span-2">
                <label>Company Name *</label>
                <input type="text" [(ngModel)]="newClient.name" name="name" required class="form-input">
              </div>
              <div class="form-group">
                <label>Industry</label>
                <input type="text" [(ngModel)]="newClient.industry" name="industry" class="form-input">
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" [(ngModel)]="newClient.website" name="website" class="form-input" placeholder="https://">
              </div>
            </div>

            <!-- Contact Info -->
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-4">Primary Contact</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>Contact Person</label>
                <input type="text" [(ngModel)]="newClient.contactPerson" name="contactPerson" class="form-input">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="newClient.email" name="email" class="form-input">
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="newClient.phone" name="phone" class="form-input">
              </div>
              <div class="form-group">
                <label>Status *</label>
                <select [(ngModel)]="newClient.status" name="status" required class="form-input">
                  <option value="PROSPECT">Prospect</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-4">Location</h3>
            <div class="grid grid-cols-2 gap-4">
               <div class="form-group">
                  <label>City</label>
                  <app-location-input 
                    [(ngModel)]="newClient.city" 
                    name="city" 
                    placeholder="Enter city">
                  </app-location-input>
               </div>
               <div class="form-group">
                  <label>Country</label>
                  <input type="text" [(ngModel)]="newClient.country" name="country" class="form-input">
               </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button type="submit" class="btn-primary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Add Client</button>
              <button type="button" (click)="showAddModal = false" class="btn-secondary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; }
    .client-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .client-details { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-badge.active { background: #10b981; color: white; }
    .status-badge.prospect { background: #f59e0b; color: white; }
    .status-badge.inactive { background: #6b7280; color: white; }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem .5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary:hover { background: var(--primary-hover-color); transform: translateY(-1px); }
    .btn-secondary {
      background: white;
      color: var(--primary-color);
      padding: 0.5rem 0.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: 2px solid var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      transition: all 0.3s;
    }
    .btn-secondary:hover { background: #f0f1ff; }
    .empty-state { text-align: center; padding: 4rem; }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      ring: 2px;
      ring-color: var(--primary-color);
    }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  showAddModal = false;
  newClient: Client = {
    name: '',
    status: 'PROSPECT'
  };

  searchTerm = '';

  constructor(
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAllClients().subscribe(clients => {
      this.clients = clients;
      this.filteredClients = clients;
    });
  }

  onSearch(term: string) {
    this.searchTerm = term.toLowerCase();
    this.filterClients();
  }

  filterClients() {
     if (!this.searchTerm) {
         this.filteredClients = this.clients;
         return;
     }

     this.filteredClients = this.clients.filter(c => 
         c.name.toLowerCase().includes(this.searchTerm) ||
         c.industry?.toLowerCase().includes(this.searchTerm) ||
         c.contactPerson?.toLowerCase().includes(this.searchTerm) ||
         c.email?.toLowerCase().includes(this.searchTerm)
     );
  }

  addClient() {
    this.clientService.createClient(this.newClient).subscribe(() => {
      this.toastService.show('Client added successfully', 'success');
      this.loadClients();
      this.showAddModal = false;
      this.newClient = { name: '', status: 'PROSPECT' };
    });
  }
}
