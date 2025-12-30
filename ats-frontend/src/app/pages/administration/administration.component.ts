import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-2">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          <p class="text-gray-500 text-sm">Create and manage internal users and client access.</p>
        </div>
        <button (click)="openCreateModal()" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          Add New User
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Username</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Roles</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let user of users" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900">{{ user.username }}</td>
              <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span *ngFor="let role of user.roles" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                  {{ role.name.replace('ROLE_', '') }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ user.client?.name || '-' }}</td>
              <td class="px-6 py-4">
                <button (click)="openEditModal(user)" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                <button (click)="confirmDelete(user)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <h2 class="text-xl font-bold mb-4">{{ editingUser ? 'Edit User' : 'Create User' }}</h2>
          <form (ngSubmit)="saveUser()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" [(ngModel)]="userForm.username" name="username" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" [(ngModel)]="userForm.email" name="email" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            </div>
            <div *ngIf="!editingUser">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" [(ngModel)]="userForm.password" name="password" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select [(ngModel)]="selectedRole" name="role" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_RECRUITER">Recruiter</option>
                <option value="ROLE_CLIENT">Client</option>
              </select>
            </div>
            <div *ngIf="selectedRole === 'ROLE_CLIENT'">
              <label class="block text-sm font-medium text-gray-700">Assign to Client</label>
              <select [(ngModel)]="userForm.clientId" name="clientId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                <option [ngValue]="null">Select a client...</option>
                <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                {{ editingUser ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdministrationComponent implements OnInit {
  users: any[] = [];
  clients: any[] = [];
  showModal = false;
  editingUser: any = null;
  selectedRole = 'ROLE_RECRUITER';

  userForm: any = {
    username: '',
    email: '',
    password: '',
    clientId: null
  };

  constructor(
    private userService: UserService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadClients();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(data => this.users = data);
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe(data => this.clients = data);
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.selectedRole = 'ROLE_RECRUITER';
    this.userForm = { username: '', email: '', password: '', clientId: null };
    this.showModal = true;
  }

  openEditModal(user: any): void {
    this.editingUser = user;
    this.selectedRole = user.roles[0]?.name || 'ROLE_RECRUITER';
    this.userForm = {
      username: user.username,
      email: user.email,
      clientId: user.client?.id || null
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    const payload = {
      ...this.userForm,
      roles: [{ name: this.selectedRole }],
      client: this.userForm.clientId ? { id: this.userForm.clientId } : null
    };

    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, payload).subscribe(() => {
        this.loadUsers();
        this.closeModal();
      });
    } else {
      this.userService.createUser(payload).subscribe((res: any) => {
        if (res && res.message) {
          alert(res.message);
        }
        this.loadUsers();
        this.closeModal();
      });
    }
  }

  confirmDelete(user: any): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => this.loadUsers());
    }
  }
}
