import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { ClientService } from '../../../services/client.service';
import { PipelineTemplateService } from '../../../services/pipeline-template.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { Job } from '../../../models/job.model';
import { Client } from '../../../models/client.model';
import { PipelineTemplate } from '../../../models/pipeline-template.model';
import { SearchBarComponent } from '../../../components/shared/search-bar/search-bar.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';
import { LocationInputComponent } from '../../../components/shared/location-input/location-input.component';
import { CandidateSelectModalComponent } from '../../../components/shared/candidate-select-modal/candidate-select-modal.component';
import { Candidate } from '../../../models/candidate.model';
import { PipelineService } from '../../../services/pipeline.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SearchBarComponent, HasRoleDirective, AvatarComponent, TagListComponent, LocationInputComponent, CandidateSelectModalComponent],
  template: `
    <div class="page-container">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">Jobs</h1>
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
             <app-search-bar 
                class="w-full md:w-64" 
                placeholder="Search jobs..." 
                (search)="onSearch($event)">
            </app-search-bar>
            <button *appHasRole="['ROLE_ADMIN', 'ROLE_RECRUITER']" (click)="showAddModal = true" class="btn-primary whitespace-nowrap">
              <i class="bi bi-plus-lg me-1"></i> Create Job
            </button>
        </div>
      </div>

      <!-- Job Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let job of filteredJobs" class="job-card card-hover">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <app-avatar 
                [name]="job.client.name" 
                [imageUrl]="job.logoUrl || job.client.logoUrl" 
                [size]="48" 
                type="job">
              </app-avatar>
              <div>
                <h3 class="text-xl font-semibold">
                  <a [routerLink]="['/jobs', job.id]" class="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                    {{ job.title }}
                  </a>
                </h3>
                 <p class="text-sm">
                  <a [routerLink]="['/clients', job.client.id]" class="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                    {{ job.client.name }}
                  </a>
                </p>
              </div>
            </div>
            <span class="status-badge" [class.open]="job.status === 'OPEN'">
              {{ job.status }}
            </span>
          </div>

          <p class="text-sm text-gray-700 mb-2 flex items-center">
            <i class="bi bi-geo-alt me-2 text-gray-400"></i> {{ job.location }}
          </p>
          <div class="flex flex-wrap gap-1 mb-2" *ngIf="job.recruiters && job.recruiters.length">
             <span *ngFor="let r of job.recruiters" class="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
               {{ r.username }}
             </span>
          </div>
          <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ job.description }}</p>
          <div class="mb-4">
            <app-tag-list [tags]="job.tags || []" [editable]="false"></app-tag-list>
          </div>

          <div class="mt-auto flex flex-col gap-2">
            <button (click)="openAssignModal(job)" class="btn-secondary !w-full">
              <i class="bi bi-person-plus me-1"></i> Add Candidates
            </button>
            <div class="flex gap-2">
              <a [routerLink]="['/jobs', job.id, 'kanban']" class="btn-primary flex-1 text-center">
                <i class="bi bi-kanban me-1"></i> Kanban
              </a>
              <a [routerLink]="['/jobs', job.id]" class="btn-secondary flex-1 text-center !mt-0">
                <i class="bi bi-info-circle me-1"></i> Details
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="filteredJobs.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p class="text-gray-500">No jobs found matching your search.</p>
        <button (click)="onSearch('')" class="text-indigo-600 hover:underline mt-2 text-sm">Clear search</button>
      </div>

      <!-- Add Job Modal -->
      <div *ngIf="showAddModal" class="modal-overlay" (click)="showAddModal = false">
        <div class="modal-content !max-w-3xl !p-10 !rounded-[5px]" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-3xl font-black text-slate-900 tracking-tight">Create New Job</h2>
              <p class="text-sm text-slate-500">Launch a new recruitment position across your organization.</p>
            </div>
            <button (click)="showAddModal = false" class="text-slate-400 hover:text-slate-900 transition-colors text-2xl"><i class="bi bi-x-lg"></i></button>
          </div>

          <form (ngSubmit)="addJob()" #jobForm="ngForm">
            <div class="grid grid-cols-12 gap-5">
              <!-- Basic Info -->
              <div class="col-span-12 form-group">
                <label>Client Organization *</label>
                <select [(ngModel)]="selectedClientId" name="client" required class="form-input !bg-indigo-50/30 font-bold">
                  <option value="">Select a client...</option>
                  <option *ngFor="let client of clients" [value]="client.id">{{ client.name }}</option>
                </select>
              </div>

              <div class="col-span-8 form-group">
                <label>Position Title *</label>
                <input type="text" [(ngModel)]="newJob.title" name="title" required class="form-input" placeholder="e.g. Senior Software Engineer">
              </div>
              <div class="col-span-4 form-group">
                <label>Job Code</label>
                <input type="text" [(ngModel)]="newJob.jobCode" name="jobCode" class="form-input" placeholder="e.g. ENG-001">
              </div>

              <div class="col-span-6 form-group">
                <label>Department</label>
                <input type="text" [(ngModel)]="newJob.department" name="department" class="form-input" placeholder="e.g. Engineering">
              </div>
              <div class="col-span-6 form-group">
                <label>Employment Type</label>
                <select [(ngModel)]="newJob.employmentType" name="employmentType" class="form-input">
                  <option [ngValue]="undefined">Select Type</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>

              <div class="col-span-12 form-group">
                <label>Job Description</label>
                <textarea [(ngModel)]="newJob.description" name="description" rows="3" class="form-input !rounded-2xl" placeholder="Describe the role and responsibilities..."></textarea>
              </div>

              <!-- Logistics -->
              <div class="col-span-4 form-group">
                <label>Headcount</label>
                <input type="number" [(ngModel)]="newJob.headcount" name="headcount" class="form-input" min="1">
              </div>
              <div class="col-span-4 form-group">
                <label>Target Date</label>
                <input type="date" [(ngModel)]="newJob.targetDate" name="targetDate" class="form-input">
              </div>
              <div class="col-span-4 form-group">
                <label>Location</label>
                <app-location-input [(ngModel)]="newJob.location" name="location" placeholder="City, Country"></app-location-input>
              </div>

              <!-- Compensation -->
              <div class="col-span-5 form-group">
                <label>Salary (Min)</label>
                <input type="number" [(ngModel)]="newJob.salaryMin" name="salaryMin" class="form-input" placeholder="0">
              </div>
              <div class="col-span-5 form-group">
                <label>Salary (Max)</label>
                <input type="number" [(ngModel)]="newJob.salaryMax" name="salaryMax" class="form-input" placeholder="0">
              </div>
              <div class="col-span-2 form-group">
                <label>Currency</label>
                <input type="text" [(ngModel)]="newJob.currency" name="currency" class="form-input" maxlength="3">
              </div>

              <!-- Skills -->
              <div class="col-span-12 form-group">
                <label>Required Skills (Comma Separated)</label>
                <input type="text" [(ngModel)]="newJob.skills" name="skills" class="form-input" placeholder="Angular, Java, Kubernetes...">
              </div>

              <!-- Pipeline & Assignment -->
              <div class="col-span-6 form-group">
                <label>Pipeline Template</label>
                <select [(ngModel)]="selectedTemplateId" name="pipelineTemplate" class="form-input !bg-slate-50">
                  <option [ngValue]="null">Default Pipeline</option>
                  <option *ngFor="let template of templates" [value]="template.id">{{ template.name }}</option>
                </select>
              </div>
              <div class="col-span-6 form-group">
                <label>Initial Status *</label>
                <select [(ngModel)]="newJob.status" name="status" required class="form-input !bg-slate-50 font-bold border-slate-200">
                  <option value="OPEN">Open</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div class="col-span-12 form-group">
                <label>Assign Recruiters</label>
                <select multiple [(ngModel)]="selectedRecruiterIds" name="recruiters" class="form-input !h-28 !rounded-2xl">
                  <option *ngFor="let user of recruiters" [value]="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.username }})</option>
                </select>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">Hold Ctrl/Cmd to select multiple members</p>
              </div>
            </div>

            <div class="flex gap-4 mt-10">
              <button type="submit" [disabled]="!jobForm.valid" class="btn-primary flex-1 py-4 uppercase tracking-widest text-[11px] font-black shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95">
                Create Job Position
              </button>
              <button type="button" (click)="showAddModal = false" class="btn-secondary py-4 px-8 uppercase tracking-widest text-[11px] font-black">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <app-candidate-select-modal
        *ngIf="showAssignModal"
        [excludeIds]="alreadyAssignedIds"
        (closeParams)="showAssignModal = false"
        (candidatesSelected)="onCandidatesSelected($event)">
      </app-candidate-select-modal>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; }
    .job-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: #6b7280;
      color: white;
      padding-top: 5px;
    }
    .status-badge.open { background: #10b981; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: inline-block;
    }
    .btn-secondary {
      background: white;
      color: var(--primary-color);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      border: 2px solid var(--primary-color);
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      margin-top: 10px;
    }
     .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      padding: 2.5rem;
      max-width: 600px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  `]
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  clients: Client[] = [];
  showAddModal = false;
  selectedClientId: string | number | null = null;
  newJob: Partial<Job> = {
    title: '',
    status: 'OPEN',
    headcount: 1,
    currency: 'USD'
  };

  templates: PipelineTemplate[] = [];
  selectedTemplateId: number | null = null;
  
  recruiters: any[] = [];
  selectedRecruiterIds: number[] = [];

  searchTerm = '';

  showAssignModal = false;
  selectedJobForAssign: Job | null = null;
  alreadyAssignedIds: number[] = [];

  constructor(
    private jobService: JobService,
    private pipelineService: PipelineService,
    private clientService: ClientService,
    private templateService: PipelineTemplateService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadJobs();
    this.loadClients();
    this.loadTemplates();
    this.loadRecruiters();
  }

  loadJobs() {
    this.jobService.getAllJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;
      this.filteredJobs = jobs;
    });
  }

  onSearch(term: string) {
      this.searchTerm = term.toLowerCase();
      this.filterJobs();
  }

  filterJobs() {
      if (!this.searchTerm) {
          this.filteredJobs = this.jobs;
          return;
      }

      this.filteredJobs = this.jobs.filter(job => 
          job.title.toLowerCase().includes(this.searchTerm) ||
          job.client?.name.toLowerCase().includes(this.searchTerm) ||
          job.location?.toLowerCase().includes(this.searchTerm) ||
          job.status.toLowerCase().includes(this.searchTerm)
      );
  }

  loadClients() {
    this.clientService.getAllClients().subscribe((clients: Client[]) => {
      this.clients = clients;
    });
  }

  loadTemplates() {
    this.templateService.getAllTemplates().subscribe((templates: PipelineTemplate[]) => {
      this.templates = templates;
    });
  }

  loadRecruiters() {
    this.userService.getAllRecruiters().subscribe((users: any[]) => {
      this.recruiters = users;
    });
  }

  addJob() {
    if (this.selectedClientId) {
      const clientId = typeof this.selectedClientId === 'string' ? 
        parseInt(this.selectedClientId) : this.selectedClientId;
      
      const client = this.clients.find(c => c.id === clientId);
      
      if (client) {
        const jobToCreate: Job = { 
          ...this.newJob, 
          client,
          pipelineTemplateId: this.selectedTemplateId || undefined
        } as Job;
        
        this.jobService.createJob(jobToCreate).subscribe({
          next: (createdJob) => {
            this.toastService.show('Job created successfully', 'success');
            
            if (this.selectedRecruiterIds.length > 0 && createdJob.id) {
               this.jobService.assignRecruiters(createdJob.id!, this.selectedRecruiterIds).subscribe();
            }

            this.loadJobs();
            this.showAddModal = false;
             this.newJob = { 
               title: '', 
               status: 'OPEN',
               headcount: 1,
               currency: 'USD'
             };
            this.selectedClientId = null;
            this.selectedTemplateId = null;
            this.selectedRecruiterIds = [];
          },
          error: (error) => {
            console.error('Error creating job:', error);
            this.toastService.show('Error creating job', 'error');
          }
        });
      }
    } else {
      this.toastService.show('Please select a client', 'warning');
    }
  }

  openAssignModal(job: Job) {
    this.selectedJobForAssign = job;
    this.alreadyAssignedIds = [];
    
    // Fetch currently assigned candidates to exclude them
    if (job.id) {
      this.pipelineService.getJobPipeline(job.id).subscribe({
        next: (pipeline) => {
          this.alreadyAssignedIds = pipeline.candidates.map((cp: any) => cp.candidate.id);
          this.showAssignModal = true;
        },
        error: (err) => {
          console.error('Error fetching job pipeline:', err);
          this.showAssignModal = true; // Still show modal even if fetch fails
        }
      });
    }
  }

  onCandidatesSelected(candidates: Candidate[]) {
    if (this.selectedJobForAssign && this.selectedJobForAssign.id) {
        const jobId = this.selectedJobForAssign.id;
        let successCount = 0;
        let total = candidates.length;

        candidates.forEach(candidate => {
            if (candidate.id) {
                this.pipelineService.assignCandidateToJob(jobId, candidate.id).subscribe({
                    next: () => {
                        successCount++;
                        if (successCount === total) {
                             this.toastService.show(`Successfully assigned ${total} candidates`, 'success');
                             this.showAssignModal = false;
                             this.selectedJobForAssign = null;
                        }
                    },
                    error: (err) => {
                        console.error('Assignment failed for ' + candidate.firstName, err);
                        this.toastService.show(`Failed to assign ${candidate.firstName}`, 'error');
                    }
                });
            }
        });
    }
  }
}
