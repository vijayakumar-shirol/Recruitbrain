import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailTemplateService } from '../../../services/email-template.service';
import { CandidateService } from '../../../services/candidate.service';
import { EmailTemplate } from '../../../models/email-template.model';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-send-email-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Send Email to {{ candidate?.firstName }} {{ candidate?.lastName }}</h2>
          <button (click)="close.emit()" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Choose Template</label>
            <select [(ngModel)]="selectedTemplateId" (change)="onTemplateSelect()" class="form-input">
              <option value="">-- Select a template or write custom --</option>
              <option *ngFor="let template of templates" [value]="template.id">{{ template.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>To</label>
            <input type="text" [value]="candidate?.email" disabled class="form-input disabled">
          </div>

          <div class="form-group">
            <label>Subject *</label>
            <input type="text" [(ngModel)]="subject" class="form-input" placeholder="Email subject">
          </div>

          <div class="form-group">
            <label>Message *</label>
            <textarea [(ngModel)]="body" class="form-input body-input" rows="10" placeholder="Write your message..."></textarea>
          </div>

          <div class="preview-note">
            <i class="bi bi-info-circle me-2"></i>
            Variables like {{ '{{' }}candidateName{{ '}}' }} will be replaced with actual values when sent.
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="previewEmail()" class="btn-secondary" [disabled]="!subject || !body">
            <i class="bi bi-eye me-2"></i>Preview
          </button>
          <button (click)="sendEmail()" class="btn-primary" [disabled]="!subject || !body || sending">
            <i class="bi bi-send me-2"></i>{{ sending ? 'Sending...' : 'Send Email' }}
          </button>
        </div>

        <!-- Preview panel (slide in) -->
        <div *ngIf="showPreview" class="preview-panel">
          <div class="preview-header">
            <h3>Email Preview</h3>
            <button (click)="showPreview = false" class="close-btn">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="preview-content">
            <div class="preview-field">
              <strong>To:</strong> {{ candidate?.email }}
            </div>
            <div class="preview-field">
              <strong>Subject:</strong> {{ previewSubject }}
            </div>
            <div class="preview-body" [innerHTML]="previewBody"></div>
          </div>
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
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      max-width: 700px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h2 { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; }

    .modal-body { padding: 1.5rem; }
    .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; gap: 1rem; justify-content: flex-end; }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
    }
    .form-input:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .form-input.disabled { background: #f9fafb; color: #6b7280; cursor: not-allowed; }
    .body-input { font-family: inherit; line-height: 1.6; resize: vertical; }

    .preview-note {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      color: #6b7280;
      background: #f9fafb;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
      color: white;
      padding: 0.5rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
      border: none;
      border: 2px solid var(--primary-color);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-secondary {
      background: white;
      color: var(--primary-color);
      padding: 0.5rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
      border: 2px solid var(--primary-color);
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

    .preview-panel {
      position: absolute;
      top: 0; right: 0; bottom: 0;
      width: 50%;
      background: #f9fafb;
      border-left: 1px solid #e5e7eb;
      overflow-y: auto;
      animation: slideIn 0.2s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }
    .preview-header h3 { margin: 0; font-size: 1rem; }
    .preview-content { padding: 1.5rem; }
    .preview-field { margin-bottom: 1rem; color: #374151; }
    .preview-body { white-space: pre-wrap; line-height: 1.8; color: #111827; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; }
  `]
})
export class SendEmailModalComponent implements OnInit {
  @Input() candidate: Candidate | null = null;
  @Input() jobTitle?: string;
  @Input() companyName?: string;
  @Output() close = new EventEmitter<void>();
  @Output() sent = new EventEmitter<void>();

  templates: EmailTemplate[] = [];
  selectedTemplateId: string = '';
  subject = '';
  body = '';
  sending = false;

  showPreview = false;
  previewSubject = '';
  previewBody = '';

  constructor(
    private emailTemplateService: EmailTemplateService,
    private candidateService: CandidateService
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.emailTemplateService.getActiveTemplates().subscribe({
      next: (templates) => this.templates = templates,
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  onTemplateSelect() {
    if (!this.selectedTemplateId) return;
    const template = this.templates.find(t => t.id === +this.selectedTemplateId);
    if (template) {
      this.subject = template.subject;
      this.body = template.body;
    }
  }

  getVariables(): { [key: string]: string } {
    return {
      candidateName: `${this.candidate?.firstName || ''} ${this.candidate?.lastName || ''}`.trim(),
      candidateFirstName: this.candidate?.firstName || '',
      candidateLastName: this.candidate?.lastName || '',
      candidateEmail: this.candidate?.email || '',
      jobTitle: this.jobTitle || 'Position',
      companyName: this.companyName || 'Company'
    };
  }

  previewEmail() {
    this.emailTemplateService.previewTemplate(this.subject, this.body, this.getVariables()).subscribe({
      next: (result) => {
        this.previewSubject = result.subject;
        this.previewBody = result.body;
        this.showPreview = true;
      },
      error: (err) => console.error('Preview failed', err)
    });
  }

  sendEmail() {
    if (!this.candidate?.id || !this.selectedTemplateId) {
      alert('Please select a template and ensure candidate is valid.');
      return;
    }

    this.sending = true;
    
    this.candidateService.sendEmail(this.candidate.id, +this.selectedTemplateId).subscribe({
      next: (response) => {
        this.sending = false;
        alert(response.message || 'Email sent successfully!');
        this.sent.emit();
        this.close.emit();
      },
      error: (err) => {
        this.sending = false;
        console.error('Email sending failed', err);
        alert('Failed to send email: ' + (err.error?.message || err.message));
      }
    });
  }
}
