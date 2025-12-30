import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../../services/interview.service';
import { UserService } from '../../../services/user.service';
import { INTERVIEW_TYPES } from '../../../models/interview.model';
import { LocationInputComponent } from '../location-input/location-input.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-interview-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule, LocationInputComponent],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 class="text-xl font-bold">Schedule Interview</h2>
            <p class="text-sm text-gray-500">{{ candidateName }} • {{ jobTitle }}</p>
          </div>
          <button (click)="close.emit()" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label>Interview Type *</label>
              <select [(ngModel)]="formData.interviewType" class="form-input">
                <option value="">Select type</option>
                <option *ngFor="let type of interviewTypes" [value]="type.value">{{ type.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration (minutes)</label>
              <select [(ngModel)]="formData.durationMinutes" class="form-input">
                <option [value]="15">15 mins</option>
                <option [value]="30">30 mins</option>
                <option [value]="45">45 mins</option>
                <option [value]="60">1 hour</option>
                <option [value]="90">1.5 hours</option>
                <option [value]="120">2 hours</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="formData.date" class="form-input">
            </div>
            <div class="form-group">
              <label>Time *</label>
              <input type="time" [(ngModel)]="formData.time" class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label>Location / Video Link</label>
            <app-location-input 
              [(ngModel)]="formData.location" 
              name="location" 
              placeholder="e.g. Room 302 or Google Meet link">
            </app-location-input>
          </div>

          <div class="form-group">
            <label>Interviewers</label>
            <div class="interviewer-selector">
              <div *ngFor="let user of allUsers" 
                   (click)="toggleInterviewer(user.id)"
                   [class.selected]="isSelected(user.id)"
                   class="interviewer-pill">
                {{ getDisplayName(user) }}
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Selected: {{ selectedInterviewerIds.size }} interviewers</p>
          </div>

          <div class="form-group">
            <label>Notes for Interviewers</label>
            <textarea [(ngModel)]="formData.notes" class="form-input" rows="4" placeholder="Briefing for the interview panel..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="close.emit()" class="btn-secondary">Cancel</button>
          <button (click)="schedule()" class="btn-primary" [disabled]="!isFormValid() || submitting">
            {{ submitting ? 'Scheduling...' : 'Schedule Interview' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      max-width: 600px;
      width: 95%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .close-btn { color: #9ca3af; background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    
    .modal-body { padding: 1.5rem; max-height: 70vh; overflow-y: auto; }
    
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .form-input:focus { border-color: var(--primary-color); ring: 2px solid rgba(99, 102, 241, 0.2); outline: none; }

    .interviewer-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      min-height: 2rem;
    }
    .interviewer-pill {
      padding: 0.5rem 0.5rem;
      background: #f3f4f6;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;
    }
    .interviewer-pill:hover { background: #e5e7eb; }
    .interviewer-pill.selected { background: var(--primary-color); color: white; }

    .modal-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--primary-hover-color); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary {
      background: white;
      color: #374151;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      border: 1px solid #d1d5db;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #f9fafb; }
  `]
})
export class InterviewSchedulerComponent implements OnInit {
  @Input() candidatePipelineId!: number;
  @Input() candidateName: string = '';
  @Input() jobTitle: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() scheduled = new EventEmitter<any>();

  interviewTypes = INTERVIEW_TYPES;
  allUsers: any[] = [];
  selectedInterviewerIds = new Set<number>();
  submitting = false;

  formData = {
    interviewType: '',
    durationMinutes: 60,
    date: '',
    time: '',
    location: '',
    notes: ''
  };

  constructor(
    private interviewService: InterviewService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.allUsers = users,
      error: (err) => console.error('Failed to load users', err)
    });
  }

  toggleInterviewer(id: number) {
    if (this.selectedInterviewerIds.has(id)) {
      this.selectedInterviewerIds.delete(id);
    } else {
      this.selectedInterviewerIds.add(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedInterviewerIds.has(id);
  }

  getDisplayName(user: any): string {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || user.email;
  }

  isFormValid(): boolean {
    return !!(this.formData.interviewType && this.formData.date && this.formData.time);
  }

  schedule() {
    if (!this.isFormValid()) return;

    this.submitting = true;
    const scheduledAt = `${this.formData.date}T${this.formData.time}:00`;

    this.interviewService.scheduleInterview({
      candidatePipelineId: this.candidatePipelineId,
      scheduledAt: scheduledAt,
      durationMinutes: this.formData.durationMinutes,
      interviewType: this.formData.interviewType,
      location: this.formData.location,
      notes: this.formData.notes,
      interviewerIds: Array.from(this.selectedInterviewerIds)
    }).subscribe({
      next: (interview) => {
        this.submitting = false;
        this.toastService.show('Interview scheduled successfully', 'success');
        this.scheduled.emit(interview);
        this.close.emit();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Failed to schedule interview', err);
      }
    });
  }
}
