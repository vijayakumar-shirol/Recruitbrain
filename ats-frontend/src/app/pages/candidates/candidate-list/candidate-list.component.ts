import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CandidateService } from '../../../services/candidate.service';
import { ToastService } from '../../../services/toast.service';
import { Candidate } from '../../../models/candidate.model';
import { SearchBarComponent } from '../../../components/shared/search-bar/search-bar.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';
import { JobSelectModalComponent } from '../../../components/shared/job-select-modal/job-select-modal.component';
import { Job } from '../../../models/job.model';
import { PipelineService } from '../../../services/pipeline.service';


@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchBarComponent, HasRoleDirective, AvatarComponent, TagListComponent, JobSelectModalComponent],
  template: `
    <div class="page-container">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">Candidates</h1>
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <app-search-bar 
                class="w-full md:w-64" 
                placeholder="Search candidates..." 
                (search)="onSearch($event)">
            </app-search-bar>
            
            <div class="flex gap-2" *appHasRole="['ROLE_ADMIN', 'ROLE_RECRUITER']">
                <input type="file" #resumeInput (change)="onFileSelected($event)" class="hidden" accept=".pdf,.doc,.docx">
                <button (click)="resumeInput.click()" class="btn-secondary whitespace-nowrap">
                  <i class="bi bi-file-earmark-arrow-up me-1"></i> Upload Resume
                </button>
                <button (click)="showAddModal = true" class="btn-primary whitespace-nowrap">
                  <i class="bi bi-person-plus me-1"></i> Add Candidate
                </button>
            </div>
        </div>
      </div>

      <!-- Candidate Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let candidate of filteredCandidates" class="candidate-card card-hover">
          <div class="flex items-start justify-between">
              <div>
                  <h3 class="text-xl font-semibold mb-1">
                    <a [routerLink]="['/candidates', candidate.id]" class="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                      {{ candidate.firstName }} {{ candidate.lastName }}
                    </a>
                  </h3>
                  <p class="text-sm text-gray-700 mb-1 font-medium">{{ candidate.currentPosition }}</p>
                  <p class="text-xs text-gray-500 mb-3">{{ candidate.currentCompany }}</p>
              </div>
              <app-avatar 
                [name]="candidate.firstName + ' ' + candidate.lastName" 
                [imageUrl]="candidate.profilePictureUrl" 
                [size]="48" 
                type="candidate">
              </app-avatar>
          </div>
          <div class="candidate-info border-t border-gray-50 pt-3 mt-1">
            <p class="text-sm flex items-center gap-2"><i class="bi bi-envelope text-gray-400"></i> {{ candidate.email }}</p>
            <p class="text-sm flex items-center gap-2"><i class="bi bi-telephone text-gray-400"></i> {{ candidate.phone || 'N/A' }}</p>
            <p class="text-sm flex items-center gap-2"><i class="bi bi-briefcase text-gray-400"></i> {{ candidate.experienceYears }} years exp</p>
          </div>

          <!-- Tags Row -->
          <div class="mt-3 flex items-center gap-1">
            <app-tag-list [tags]="candidate.tags || []" [editable]="false"></app-tag-list>
          </div>

          <div *ngIf="candidate.skills" class="mt-3 mb-4">
            <div class="flex flex-wrap gap-1">
                <span *ngFor="let skill of getSkillsArray(candidate.skills)" 
                      class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {{ skill }}
                </span>
            </div>
          </div>

          <div class="mt-auto pt-4 flex gap-2">
            <button (click)="openAssignModal(candidate)" class="flex-1 py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors text-sm">
                Assign to Job
            </button>
            <a [routerLink]="['/candidates', candidate.id]" class="flex-1 text-center py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors text-sm">
              View Profile
            </a>
          </div>
        </div>
      </div>
      
      <div *ngIf="filteredCandidates.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p class="text-gray-500">No candidates found matching your search.</p>
        <button (click)="onSearch('')" class="text-indigo-600 hover:underline mt-2 text-sm">Clear search</button>
      </div>

      <!-- Add Candidate Modal -->
      <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal = false">
        <!-- ... modal content same as before ... -->
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-4">Add New Candidate</h2>
          <form (ngSubmit)="addCandidate()">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="newCandidate.firstName" name="firstName" required class="form-input">
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="newCandidate.lastName" name="lastName" required class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="newCandidate.email" name="email" required class="form-input">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="newCandidate.phone" name="phone" class="form-input">
            </div>
            <div class="form-group">
              <label>Current Position</label>
              <input type="text" [(ngModel)]="newCandidate.currentPosition" name="currentPosition" class="form-input">
            </div>
            <div class="form-group">
              <label>Current Company</label>
              <input type="text" [(ngModel)]="newCandidate.currentCompany" name="currentCompany" class="form-input">
            </div>
            <div class="form-group">
              <label>Experience Years</label>
              <input type="number" [(ngModel)]="newCandidate.experienceYears" name="experienceYears" class="form-input">
            </div>
            <div class="form-group">
              <label>Skills</label>
              <input type="text" [(ngModel)]="newCandidate.skills" name="skills" placeholder="e.g., Java, React, SQL" class="form-input">
            </div>
            <div class="flex gap-2 mt-6">
              <button type="submit" class="btn-primary flex-1">Add Candidate</button>
              <button type="button" (click)="showAddModal = false" class="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      
      <app-job-select-modal
        *ngIf="showAssignModal"
        [excludeIds]="alreadyAssignedJobIds"
        (closeParams)="showAssignModal = false"
        (jobSelected)="onJobSelected($event)">
      </app-job-select-modal>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; }
    .candidate-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .candidate-info { display: flex; flex-direction: column; gap: 0.5rem; }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .btn-secondary {
      background: white;
      color: var(--primary-color);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      border: 2px solid var(--primary-color);
      cursor: pointer;
    }
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
      max-width: 600px;
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
  `]
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  showAddModal = false;
  newCandidate: Candidate = {
    firstName: '',
    lastName: '',
    email: ''
  };

  selectedResumeFile: File | null = null;
  searchTerm = '';
  
  showAssignModal = false;
  selectedCandidateForAssign: Candidate | null = null;
  alreadyAssignedJobIds: number[] = [];

  constructor(
    private candidateService: CandidateService,
    private pipelineService: PipelineService,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.candidateService.getAllCandidates().subscribe(candidates => {
      this.candidates = candidates;
      this.filteredCandidates = candidates;
    });
  }
  
  onSearch(term: string) {
    this.searchTerm = term.toLowerCase();
    this.filterCandidates();
  }

  filterCandidates() {
    if (!this.searchTerm) {
        this.filteredCandidates = this.candidates;
        return;
    }
    
    this.filteredCandidates = this.candidates.filter(c => 
        c.firstName.toLowerCase().includes(this.searchTerm) ||
        c.lastName.toLowerCase().includes(this.searchTerm) ||
        c.email.toLowerCase().includes(this.searchTerm) ||
        (c.skills && c.skills.toLowerCase().includes(this.searchTerm)) ||
        (c.currentPosition && c.currentPosition.toLowerCase().includes(this.searchTerm))
    );
  }

  getSkillsArray(skills: string | undefined): string[] {
      if (!skills) return [];
      return skills.split(',').map(s => s.trim()).slice(0, 3); // Show max 3 tags
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedResumeFile = file;
      this.parseResume(file);
    }
  }

  parseResume(file: File) {
    // Show some loading state if needed
    this.candidateService.parseResume(file).subscribe({
      next: (parsedCandidate) => {
        // Pre-fill form
        this.newCandidate = {
           ...this.newCandidate,
           firstName: parsedCandidate.firstName || '',
           lastName: parsedCandidate.lastName || '',
           email: parsedCandidate.email || '',
           phone: parsedCandidate.phone || '',
           skills: parsedCandidate.skills || ''
        };
        this.showAddModal = true; // Open modal if not already open
      },
      error: (err) => {
        console.error('Parsing failed', err);
        this.toastService.show('Failed to parse resume. Please enter details manually.', 'warning');
        this.showAddModal = true;
      }
    });
  }

  addCandidate() {
    this.candidateService.createCandidate(this.newCandidate).subscribe((createdCandidate) => {
      if (this.selectedResumeFile) {
        this.uploadResume(this.selectedResumeFile, createdCandidate.id!);
      }
      this.toastService.show('Candidate created successfully', 'success');
      this.loadCandidates();
      this.showAddModal = false;
      this.newCandidate = { firstName: '', lastName: '', email: '' };
      this.selectedResumeFile = null;
    });
  }

  uploadResume(file: File, candidateId: number) {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('relatedType', 'CANDIDATE');
     formData.append('relatedId', candidateId.toString());

     this.http.post('http://localhost:8080/api/attachments/upload', formData).subscribe({
         next: () => this.toastService.show('Resume uploaded successfully', 'success'),
         error: (err) => console.error('Resume upload failed', err)
     });
  }

  openAssignModal(candidate: Candidate) {
    this.selectedCandidateForAssign = candidate;
    this.alreadyAssignedJobIds = [];
    
    if (candidate.id) {
      this.pipelineService.getCandidatePipelines(candidate.id).subscribe({
        next: (pipelines) => {
          this.alreadyAssignedJobIds = pipelines.map(p => p.job.id!);
          this.showAssignModal = true;
        },
        error: (err) => {
          console.error('Error fetching candidate pipelines:', err);
          this.showAssignModal = true;
        }
      });
    }
  }

  onJobSelected(job: Job) {
    if (this.selectedCandidateForAssign && this.selectedCandidateForAssign.id && job.id) {
        this.pipelineService.assignCandidateToJob(job.id, this.selectedCandidateForAssign.id).subscribe({
            next: () => {
                this.toastService.show(`Assigned ${this.selectedCandidateForAssign?.firstName} to ${job.title}`, 'success');
                this.showAssignModal = false;
                this.selectedCandidateForAssign = null;
            },
            error: (err) => {
                console.error('Assignment failed', err);
                this.toastService.show('Failed to assign candidate to job', 'error');
            }
        });
    }
  }
}
