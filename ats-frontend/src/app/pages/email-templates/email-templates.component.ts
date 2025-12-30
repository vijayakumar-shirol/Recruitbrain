import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmailTemplateService } from '../../services/email-template.service';
import { EmailTemplate, EMAIL_TEMPLATE_CATEGORIES } from '../../models/email-template.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Email Templates</h1>
          <p class="page-subtitle">Create and manage email templates for candidate communication</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary">
          <i class="bi bi-plus-lg me-2"></i>New Template
        </button>
      </div>

      <!-- Category Filter -->
      <div class="filter-bar">
        <button 
          *ngFor="let cat of categories"
          (click)="filterCategory = cat.value"
          [class.active]="filterCategory === cat.value"
          class="filter-btn">
          {{ cat.label }}
        </button>
        <button 
          (click)="filterCategory = ''"
          [class.active]="filterCategory === ''"
          class="filter-btn">
          All
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="templates-grid">
        <div *ngFor="let template of filteredTemplates" class="template-card">
          <div class="template-header">
            <span class="template-category" [attr.data-category]="template.category">
              {{ getCategoryLabel(template.category) }}
            </span>
            <div class="template-actions">
              <button (click)="editTemplate(template)" class="action-btn" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button (click)="duplicateTemplate(template)" class="action-btn" title="Duplicate">
                <i class="bi bi-copy"></i>
              </button>
              <button (click)="deleteTemplate(template)" class="action-btn delete" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <h3 class="template-name">{{ template.name }}</h3>
          <p class="template-subject">{{ template.subject }}</p>
          <div class="template-preview" [innerHTML]="truncateBody(template.body)"></div>
          <div class="template-footer">
            <span class="template-status" [class.active]="template.active">
              {{ template.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div *ngIf="filteredTemplates.length === 0" class="empty-state">
          <i class="bi bi-envelope-paper"></i>
          <p>No templates found. Create your first email template!</p>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingTemplate ? 'Edit Template' : 'Create Template' }}</h2>
            <button (click)="closeModal()" class="close-btn">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Template Name *</label>
                <input type="text" [(ngModel)]="formData.name" class="form-input" placeholder="e.g., Interview Invitation">
              </div>
              <div class="form-group">
                <label>Category</label>
                <select [(ngModel)]="formData.category" class="form-input">
                  <option value="">Select category</option>
                  <option *ngFor="let cat of categories" [value]="cat.value">{{ cat.label }}</option>
                </select>
              </div>
            </div>

              <div class="form-group">
                <label>Subject Line *</label>
                <input type="text" [(ngModel)]="formData.subject" class="form-input" placeholder="e.g., Interview Scheduled for {{ '{{' }}jobTitle{{ '}}' }}">
              </div>

            <div class="form-group">
              <label>Email Body *</label>
              <div class="variables-help">
                <span class="help-title">Available Variables:</span>
                <code *ngFor="let v of availableVariables" class="variable-tag" (click)="insertVariable(v)">{{ '{{' }}{{ v }}{{ '}}' }}</code>
              </div>
              <textarea [(ngModel)]="formData.body" class="form-input body-input" rows="12" placeholder="Dear {{ '{{' }}candidateName{{ '}}' }},

We are pleased to invite you for an interview..."></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="formData.active">
                <span>Active Template</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="previewTemplate()" class="btn-secondary">
              <i class="bi bi-eye me-2"></i>Preview
            </button>
            <button (click)="saveTemplate()" class="btn-primary" [disabled]="!isFormValid()">
              {{ editingTemplate ? 'Update Template' : 'Create Template' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <div *ngIf="showPreviewModal" class="modal-overlay" (click)="showPreviewModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Template Preview</h2>
            <button (click)="showPreviewModal = false" class="close-btn">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body preview-body">
            <div class="preview-subject">
              <strong>Subject:</strong> {{ previewSubject }}
            </div>
            <div class="preview-content" [innerHTML]="previewBody"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { color: #6b7280; margin-top: 0.25rem; }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color), #8b5cf6);
      color: white;
      padding: 0.5rem .5rem;
      border-radius: 10px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

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
    .btn-secondary:hover { background: #f0f0ff; }

    .filter-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .template-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s;
      border: 1px solid #e5e7eb;
    }
    .template-card:hover {
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transform: translateY(-4px);
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .template-category {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      background: #e0e7ff;
      color: #4338ca;
    }
    .template-category[data-category="interview"] { background: #dcfce7; color: #166534; }
    .template-category[data-category="offer"] { background: #fef3c7; color: #92400e; }
    .template-category[data-category="rejection"] { background: #fee2e2; color: #991b1b; }
    .template-category[data-category="followup"] { background: #dbeafe; color: #1e40af; }

    .template-actions { display: flex; gap: 0.5rem; }
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn:hover { background: #e5e7eb; color: #111827; }
    .action-btn.delete:hover { background: #fee2e2; color: #dc2626; }

    .template-name { font-size: 1.1rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem; }
    .template-subject { font-size: 0.9rem; color: #6b7280; margin: 0 0 0.75rem; }
    .template-preview {
      font-size: 0.85rem;
      color: #9ca3af;
      line-height: 1.5;
      max-height: 60px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .template-footer { display: flex; justify-content: flex-end; }
    .template-status {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: #f3f4f6;
      color: #6b7280;
    }
    .template-status.active { background: #dcfce7; color: #166534; }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem;
      color: #9ca3af;
    }
    .empty-state i { font-size: 3rem; margin-bottom: 1rem; }

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
      padding: 2rem;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-content.modal-lg { max-width: 800px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-header h2 { font-size: 1.5rem; font-weight: 600; margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; }

    .modal-body { padding: 1.5rem; }
    .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; gap: 1rem; justify-content: flex-end; }

    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .form-input:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .body-input { font-family: monospace; line-height: 1.6; }

    .variables-help {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .help-title { font-size: 0.85rem; color: #6b7280; }
    .variable-tag {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      background: #f3f4f6;
      border-radius: 4px;
      cursor: pointer;
    }
    .variable-tag:hover { background: #e5e7eb; }

    .checkbox-group { margin-top: 1rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .checkbox-label input { width: 18px; height: 18px; }

    .preview-body { background: #f9fafb; border-radius: 8px; padding: 1.5rem; }
    .preview-subject { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .preview-content { line-height: 1.8; white-space: pre-wrap; }
  `]
})
export class EmailTemplatesComponent implements OnInit {
  templates: EmailTemplate[] = [];
  filterCategory = '';
  categories = EMAIL_TEMPLATE_CATEGORIES;

  showModal = false;
  editingTemplate: EmailTemplate | null = null;
  formData: Partial<EmailTemplate> = this.getEmptyForm();

  showPreviewModal = false;
  previewSubject = '';
  previewBody = '';

  availableVariables = ['candidateName', 'candidateFirstName', 'candidateLastName', 'candidateEmail', 'jobTitle', 'jobLocation', 'companyName', 'recruiterName'];

  constructor(
    private emailTemplateService: EmailTemplateService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.emailTemplateService.getAllTemplates().subscribe({
      next: (templates) => this.templates = templates,
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  get filteredTemplates(): EmailTemplate[] {
    if (!this.filterCategory) return this.templates;
    return this.templates.filter(t => t.category === this.filterCategory);
  }

  getEmptyForm(): Partial<EmailTemplate> {
    return { name: '', subject: '', body: '', category: '', active: true };
  }

  getCategoryLabel(category?: string): string {
    if (!category) return 'General';
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  truncateBody(body: string): string {
    const stripped = body.replace(/<[^>]*>/g, '');
    return stripped.length > 100 ? stripped.substring(0, 100) + '...' : stripped;
  }

  openCreateModal() {
    this.editingTemplate = null;
    this.formData = this.getEmptyForm();
    this.showModal = true;
  }

  editTemplate(template: EmailTemplate) {
    this.editingTemplate = template;
    this.formData = { ...template };
    this.showModal = true;
  }

  duplicateTemplate(template: EmailTemplate) {
    this.editingTemplate = null;
    this.formData = { ...template, id: undefined, name: template.name + ' (Copy)' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingTemplate = null;
    this.formData = this.getEmptyForm();
  }

  isFormValid(): boolean {
    return !!(this.formData.name && this.formData.subject && this.formData.body);
  }

  insertVariable(variable: string) {
    this.formData.body = (this.formData.body || '') + `{{${variable}}}`;
  }

  saveTemplate() {
    if (!this.isFormValid()) return;

    const template = this.formData as EmailTemplate;

    if (this.editingTemplate?.id) {
      this.emailTemplateService.updateTemplate(this.editingTemplate.id, template).subscribe({
        next: () => { 
          this.toastService.show('Template updated successfully', 'success');
          this.loadTemplates(); 
          this.closeModal(); 
        },
        error: (err) => console.error('Failed to update template', err)
      });
    } else {
      this.emailTemplateService.createTemplate(template).subscribe({
        next: () => { 
          this.toastService.show('Template created successfully', 'success');
          this.loadTemplates(); 
          this.closeModal(); 
        },
        error: (err) => console.error('Failed to create template', err)
      });
    }
  }

  deleteTemplate(template: EmailTemplate) {
    if (confirm('Are you sure you want to delete this template?')) {
      this.emailTemplateService.deleteTemplate(template.id!).subscribe({
        next: () => {
          this.toastService.show('Template deleted successfully', 'success');
          this.loadTemplates();
        },
        error: (err) => console.error('Failed to delete template', err)
      });
    }
  }

  previewTemplate() {
    const sampleVariables = {
      candidateName: 'John Smith',
      candidateFirstName: 'John',
      candidateLastName: 'Smith',
      candidateEmail: 'john.smith@email.com',
      jobTitle: 'Senior Developer',
      jobLocation: 'New York, NY',
      companyName: 'Tech Corp',
      recruiterName: 'Sarah Johnson'
    };

    this.emailTemplateService.previewTemplate(
      this.formData.subject || '',
      this.formData.body || '',
      sampleVariables
    ).subscribe({
      next: (result) => {
        this.previewSubject = result.subject;
        this.previewBody = result.body;
        this.showPreviewModal = true;
      },
      error: (err) => console.error('Failed to preview', err)
    });
  }
}
