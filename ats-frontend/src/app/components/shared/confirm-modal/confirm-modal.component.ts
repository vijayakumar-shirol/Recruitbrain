import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content animate-in fade-in zoom-in duration-200" (click)="$event.stopPropagation()">
        <div class="text-center">
          <div class="icon-container mb-4">
            <i [class]="icon" class="bi text-4xl text-red-500"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-900 mb-2">{{ title }}</h2>
          <p class="text-slate-500 mb-8">{{ message }}</p>
          
          <div class="flex gap-3">
            <button (click)="onConfirm()" class="btn-confirm flex-1">
              {{ confirmLabel }}
            </button>
            <button (click)="onCancel()" class="btn-cancel flex-1">
              {{ cancelLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 5px;
      padding: 2.5rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .icon-container {
      width: 80px;
      height: 80px;
      background: #fef2f2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .btn-confirm {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      font-weight: 700;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-confirm:hover {
      background: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
    }

    .btn-cancel {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      font-weight: 700;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() title: string = 'Are you sure?';
  @Input() message: string = 'This action cannot be undone.';
  @Input() confirmLabel: string = 'Yes, Delete';
  @Input() cancelLabel: string = 'Cancel';
  @Input() icon: string = 'bi-exclamation-triangle';

  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.canceled.emit();
  }
}
