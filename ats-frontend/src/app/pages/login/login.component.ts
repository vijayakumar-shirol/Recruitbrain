import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div class="flex flex-col items-center">
          <img src="/logo-horizontal.png" alt="RecruitBrain" class="h-24 w-auto mb-6">
          <h2 class="text-center text-3xl font-extrabold text-gray-900">
            Sign in to ATS
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the dashboard
          </p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div class="mb-4">
              <label for="username" class="sr-only">Username</label>
              <input id="username" name="username" type="text" required 
                [(ngModel)]="form.username"
                class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" 
                placeholder="Username">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" required 
                [(ngModel)]="form.password"
                class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" 
                placeholder="Password">
            </div>
          </div>
          
          <div *ngIf="isLoginFailed" class="text-red-600 text-center text-sm bg-red-50 p-2 rounded">
            Login failed: {{ errorMessage }}
          </div>

          <div>
            <button type="submit" 
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Sign in
            </button>
          </div>
          
          <div class="text-center mt-4">
            <p class="text-sm text-gray-500">Default: admin / admin123</p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  form: any = {
    username: '',
    password: ''
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login({ username, password }).subscribe({
      next: data => {
        this.isLoggedIn = true;
        this.isLoginFailed = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Invalid credentials';
        this.isLoginFailed = true;
      }
    });
  }
}
