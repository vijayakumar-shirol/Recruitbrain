import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../services/activity.service';
import { Activity } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col">
       <div class="mb-6 bg-gray-50 p-4 rounded-lg">
         <textarea [(ngModel)]="newNote" 
                   placeholder="Add a note..."
                   rows="3"
                   class="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"></textarea>
         <div class="flex justify-end">
           <button (click)="addNote()" 
                   [disabled]="!newNote.trim()"
                   class="btn-primary">
             Post Note
           </button>
         </div>
       </div>

       <div class="space-y-6 flex-1 overflow-y-auto pr-2">
         <div *ngFor="let activity of activities" class="timeline-item">
           <div class="timeline-icon" [ngClass]="getActivityIconClass(activity.type)">
             {{ getActivityIcon(activity.type) }}
           </div>
           <div class="timeline-content">
             <div class="flex justify-between items-start">
               <span class="font-semibold text-gray-900">{{ activity.createdBy || 'System' }}</span>
               <span class="text-xs text-gray-500">{{ activity.createdAt | date:'medium' }}</span>
             </div>
             <p class="text-gray-700 mt-1 whitespace-pre-wrap">{{ activity.content }}</p>
             <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-2 inline-block">
               {{ activity.type }}
             </span>
           </div>
         </div>

         <div *ngIf="activities.length === 0" class="text-center py-8 text-gray-500">
           No history yet. Start by adding a note!
         </div>
       </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover-color);
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }
    
    /* Connector Line */
    .timeline-item:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 2.5rem;
      bottom: -1.5rem;
      width: 2px;
      background: #e5e7eb;
      z-index: 0;
    }

    .timeline-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      z-index: 1;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
      background: white;
      padding-bottom: 1rem;
    }

    .icon-note { background: #fef3c7; color: #d97706; }
    .icon-status { background: #dbeafe; color: #2563eb; }
    .icon-email { background: #e0e7ff; color: #4338ca; }
    .icon-call { background: #dcfce7; color: #15803d; }
    .icon-default { background: #f3f4f6; color: #6b7280; }
  `]
})
export class ActivityTimelineComponent implements OnInit, OnChanges {
  @Input() relatedType!: string;
  @Input() relatedId!: number;

  activities: Activity[] = [];
  newNote = '';

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    if (this.relatedId) {
      this.loadActivities();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['relatedId'] && !changes['relatedId'].firstChange) {
       this.loadActivities();
    }
  }

  loadActivities() {
    this.activityService.getActivities(this.relatedType, this.relatedId).subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (err) => console.error('Error loading activities:', err)
    });
  }

  addNote() {
    if (!this.newNote.trim()) return;

    const activity: Activity = {
      relatedType: this.relatedType as 'CLIENT' | 'JOB' | 'CANDIDATE',
      relatedId: this.relatedId,
      type: 'NOTE',
      content: this.newNote
    };

    this.activityService.createActivity(activity).subscribe({
      next: (newActivity) => {
        this.activities.unshift(newActivity);
        this.newNote = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add note');
      }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'NOTE': return '📝';
      case 'STATUS_CHANGE': return '🔄';
      case 'EMAIL': return '📧';
      case 'CALL': return '📞';
      default: return '•';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'NOTE': return 'icon-note';
      case 'STATUS_CHANGE': return 'icon-status';
      case 'EMAIL': return 'icon-email';
      case 'CALL': return 'icon-call';
      default: return 'icon-default';
    }
  }
}
