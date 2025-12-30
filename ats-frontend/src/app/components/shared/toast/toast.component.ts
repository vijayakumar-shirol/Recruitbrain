import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts$ | async; trackBy: trackById"
           class="pointer-events-auto transform transition-all duration-300 ease-in-out min-w-[300px] max-w-md shadow-lg rounded-lg overflow-hidden border-l-4"
           [ngClass]="{
             'bg-white border-green-500': toast.type === 'success',
             'bg-white border-red-500': toast.type === 'error',
             'bg-white border-blue-500': toast.type === 'info',
             'bg-white border-yellow-500': toast.type === 'warning'
           }">
        <div class="p-4 flex items-start gap-3">
          <!-- Icons based on type -->
          <div class="flex-shrink-0 mt-0.5">
            <i class="bi bi-check-circle-fill text-green-500 text-lg" *ngIf="toast.type === 'success'"></i>
            <i class="bi bi-x-circle-fill text-red-500 text-lg" *ngIf="toast.type === 'error'"></i>
            <i class="bi bi-info-circle-fill text-blue-500 text-lg" *ngIf="toast.type === 'info'"></i>
            <i class="bi bi-exclamation-triangle-fill text-yellow-500 text-lg" *ngIf="toast.type === 'warning'"></i>
          </div>
          
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 leading-5">
              {{ toast.type | titlecase }}
            </p>
            <p class="text-sm text-gray-500 mt-1 leading-4">
              {{ toast.message }}
            </p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="bi bi-x text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  trackById(index: number, toast: Toast): string {
    return toast.id;
  }
}
