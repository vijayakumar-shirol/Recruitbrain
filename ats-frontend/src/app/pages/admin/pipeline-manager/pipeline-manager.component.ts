import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipelineTemplateService } from '../../../services/pipeline-template.service';
import { PipelineTemplate, PipelineTemplateStage } from '../../../models/pipeline-template.model';

@Component({
  selector: 'app-pipeline-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Pipeline Templates</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          ➕ New Template
        </button>
      </div>

      <!-- Template List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let template of templates" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ template.name }}</h3>
            <div class="flex gap-2">
              <button (click)="editTemplate(template)" class="text-primary-600 hover:text-primary-800">
                ✏️
              </button>
              <button (click)="deleteTemplate(template.id!)" class="text-red-600 hover:text-red-800">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="space-y-2">
            <div *ngFor="let stage of template.stages" class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" [style.backgroundColor]="stage.color"></span>
              <span class="text-sm text-gray-700">{{ stage.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit' : 'Create' }} Template</h2>
          
          <form (ngSubmit)="saveTemplate()">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input type="text" [(ngModel)]="currentTemplate.name" name="name" required
                     class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
            </div>

            <div class="mb-6">
              <div class="flex justify-between items-center mb-4">
                <label class="block text-sm font-medium text-gray-700">Stages</label>
                <button type="button" (click)="addStage()" class="text-sm text-primary-600 font-medium">
                  + Add Stage
                </button>
              </div>

              <div class="space-y-3">
                <div *ngFor="let stage of currentTemplate.stages; let i = index" class="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <span class="text-gray-400 font-mono">{{ i + 1 }}</span>
                  <input type="text" [(ngModel)]="stage.name" name="stageName{{i}}" placeholder="Stage Name" required
                         class="flex-1 px-3 py-1.5 border rounded">
                  <input type="color" [(ngModel)]="stage.color" name="stageColor{{i}}"
                         class="h-8 w-12 p-0 border rounded cursor-pointer">
                  <button type="button" (click)="removeStage(i)" class="text-red-500 hover:text-red-700 font-bold px-2">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-8 border-t pt-4">
              <button type="button" (click)="showModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700">
                Save Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
    }
  `]
})
export class PipelineManagerComponent implements OnInit {
  templates: PipelineTemplate[] = [];
  showModal = false;
  isEditing = false;
  
  currentTemplate: PipelineTemplate = {
    name: '',
    stages: []
  };

  constructor(private templateService: PipelineTemplateService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.templateService.getAllTemplates().subscribe(data => {
      this.templates = data;
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentTemplate = {
      name: '',
      stages: [
        { name: 'Applied', position: 0, color: '#3b82f6' },
        { name: 'Screening', position: 1, color: '#8b5cf6' },
        { name: 'Interview', position: 2, color: '#ec4899' },
        { name: 'Offer', position: 3, color: '#10b981' },
        { name: 'Hired', position: 4, color: '#22c55e' }
      ]
    };
    this.showModal = true;
  }

  editTemplate(template: PipelineTemplate) {
    this.isEditing = true;
    // Deep copy to avoid modifying original array while editing
    this.currentTemplate = JSON.parse(JSON.stringify(template));
    this.showModal = true;
  }

  addStage() {
    this.currentTemplate.stages.push({
      name: 'New Stage',
      position: this.currentTemplate.stages.length,
      color: '#9ca3af'
    });
  }

  removeStage(index: number) {
    this.currentTemplate.stages.splice(index, 1);
    // Re-index positions
    this.currentTemplate.stages.forEach((s, i) => s.position = i);
  }

  saveTemplate() {
    if (this.isEditing && this.currentTemplate.id) {
      this.templateService.updateTemplate(this.currentTemplate.id, this.currentTemplate).subscribe(() => {
        this.loadTemplates();
        this.showModal = false;
      });
    } else {
      this.templateService.createTemplate(this.currentTemplate).subscribe(() => {
        this.loadTemplates();
        this.showModal = false;
      });
    }
  }

  deleteTemplate(id: number) {
    if (confirm('Are you sure you want to delete this template?')) {
      this.templateService.deleteTemplate(id).subscribe(() => {
        this.loadTemplates();
      });
    }
  }
}
