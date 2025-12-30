import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PipelineService } from '../../../services/pipeline.service';
import { JobService } from '../../../services/job.service';
import { CandidateService } from '../../../services/candidate.service';
import { PipelineStage, CandidatePipeline } from '../../../models/pipeline.model';
import { Job } from '../../../models/job.model';
import { Candidate } from '../../../models/candidate.model';
import { InterviewSchedulerComponent } from '../../../components/shared/interview-scheduler/interview-scheduler.component';
import { ToastService } from '../../../services/toast.service';

interface StageWithCandidates extends PipelineStage {
  candidates: CandidatePipeline[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, InterviewSchedulerComponent],
  template: `
    <div class="kanban-container">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ job?.title }}</h1>
          <p class="text-gray-600 mt-1">{{ job?.client?.name }} • {{ job?.location }}</p>
        </div>
        <button (click)="showAddCandidateModal = true" class="btn-add">
          <i class="bi bi-plus-lg me-1"></i> Add Candidate
        </button>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board">
        <div
          *ngFor="let stage of stages"
          class="kanban-column"
          cdkDropList
          [cdkDropListData]="stage.candidates"
          [cdkDropListConnectedTo]="getConnectedLists()"
          (cdkDropListDropped)="drop($event, stage)">
          
          <!-- Stage Header -->
          <div class="stage-header" [style.border-color]="stage.color">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="stage-color" [style.background-color]="stage.color"></div>
                <h3 class="stage-title">{{ stage.name }}</h3>
              </div>
              <span class="stage-count">{{ stage.candidates.length || 0 }}</span>
            </div>
          </div>

          <!-- Candidate Cards -->
          <div class="candidates-container">
            <div
              *ngFor="let candidatePipeline of stage.candidates"
              class="candidate-card card-hover"
              cdkDrag>
              
              <div class="candidate-header">
                <h4 class="candidate-name">
                  {{ candidatePipeline.candidate.firstName }} {{ candidatePipeline.candidate.lastName }}
                </h4>
                <div *ngIf="candidatePipeline.candidate.rating" class="flex gap-1 text-amber-400">
                  <i *ngFor="let star of [1,2,3,4,5]" 
                     class="bi" 
                     [class.bi-star-fill]="star <= candidatePipeline.candidate.rating"
                     [class.bi-star]="star > candidatePipeline.candidate.rating"></i>
                </div>
                <button (click)="$event.stopPropagation(); openScheduler(candidatePipeline)" 
                        class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Schedule Interview">
                  <i class="bi bi-calendar-event"></i>
                </button>
              </div>

              <div class="candidate-details">
                <p class="text-sm text-gray-600">{{ candidatePipeline.candidate.currentPosition }}</p>
                <p class="text-sm text-gray-500">{{ candidatePipeline.candidate.currentCompany }}</p>
                <p class="text-xs text-gray-400 mt-2">
                  {{ candidatePipeline.candidate.experienceYears }} years exp
                </p>
                
                <div *ngIf="candidatePipeline.matchScore !== undefined" class="mt-2 flex items-center gap-1">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': candidatePipeline.matchScore >= 80,
                          'bg-yellow-100 text-yellow-800': candidatePipeline.matchScore >= 50 && candidatePipeline.matchScore < 80,
                          'bg-red-100 text-red-800': candidatePipeline.matchScore < 50
                        }">
                    {{ candidatePipeline.matchScore }}% Match
                  </span>
                </div>
              </div>

              <div *ngIf="candidatePipeline.notes" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                {{ candidatePipeline.notes }}
              </div>

              <!-- Drag Preview -->
              <div *cdkDragPreview class="drag-preview">
                <div class="candidate-card">
                  <h4 class="font-semibold">
                    {{ candidatePipeline.candidate.firstName }} {{ candidatePipeline.candidate.lastName }}
                  </h4>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!stage.candidates || stage.candidates.length === 0" class="empty-state">
              <p class="text-gray-400 text-sm">No candidates</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Candidate Modal -->
      <div *ngIf="showAddCandidateModal" class="modal-overlay" (click)="showAddCandidateModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-4">Add Candidate to Pipeline</h2>
          
          <!-- Stage Selection -->
          <div class="form-group mb-4">
            <label class="block font-semibold mb-2">Select Stage</label>
            <select [(ngModel)]="selectedStageId" class="form-input">
              <option *ngFor="let stage of stages" [value]="stage.id">
                {{ stage.name }}
              </option>
            </select>
          </div>

          <!-- Candidate List -->
          <div class="candidate-list">
            <h3 class="font-semibold mb-3">Available Candidates</h3>
            
            <div *ngIf="availableCandidates.length === 0" class="text-center py-8 text-gray-500">
              <p>All candidates are already added to this job.</p>
              <p class="text-sm mt-2">Create new candidates from the Candidates page.</p>
            </div>

            <div *ngFor="let candidate of availableCandidates" 
                 class="candidate-item"
                 (click)="addCandidateToJob(candidate)">
              <div>
                <h4 class="font-semibold">{{ candidate.firstName }} {{ candidate.lastName }}</h4>
                <p class="text-sm text-gray-600">{{ candidate.currentPosition }} at {{ candidate.currentCompany }}</p>
                <p class="text-xs text-gray-500">{{ candidate.experienceYears }} years experience</p>
              </div>
              <button class="btn-add-small">Add</button>
            </div>
          </div>

          <div class="mt-4">
            <button (click)="showAddCandidateModal = false" class="btn-cancel w-full">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interview Scheduler Modal -->
    <app-interview-scheduler
      *ngIf="showScheduler"
      [candidatePipelineId]="selectedCandidatePipeline?.id!"
      [candidateName]="selectedCandidatePipeline?.candidate?.firstName + ' ' + selectedCandidatePipeline?.candidate?.lastName"
      [jobTitle]="job?.title || ''"
      (close)="showScheduler = false"
      (scheduled)="onInterviewScheduled($event)">
    </app-interview-scheduler>
  `,
  styles: [`
    .kanban-container {
      padding: 1.5rem;
    }

    .kanban-board {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1rem;
    }

    .kanban-column {
      min-width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stage-header {
      padding: 1rem;
      border-bottom: 3px solid;
      border-radius: 12px 12px 0 0;
    }

    .stage-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .stage-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .stage-count {
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
    }

    .candidates-container {
      padding: 1rem;
      min-height: 400px;
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }

    .candidate-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
      cursor: move;
    }

    .candidate-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }

    .candidate-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.5rem;
    }

    .candidate-name {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .candidate-details p {
      margin: 0.25rem 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .candidate-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-placeholder {
      opacity: 0.4;
      background: #f3f4f6;
      border: 2px dashed var(--primary-color);
    }

    .drag-preview {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      border: 2px dashed #e5e7eb;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .btn-add {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 0.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add:hover {
      background: var(--primary-hover-color);
      transform: translateY(-1px);
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
      max-height: 80vh;
      overflow-y: auto;
    }

    .form-group label {
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
    }

    .candidate-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .candidate-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .candidate-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-add-small {
      background: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;
      border: none;
      cursor: pointer;
    }

    .btn-cancel {
      background: #6b7280;
      color: white;
      padding: 0.75rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  job: Job | null = null;
  stages: StageWithCandidates[] = [];
  jobId!: number;
  
  // Add candidate modal
  showAddCandidateModal = false;
  allCandidates: Candidate[] = [];
  availableCandidates: Candidate[] = [];
  selectedStageId: number | null = null;

  // Interview Scheduler
  showScheduler = false;
  selectedCandidatePipeline: CandidatePipeline | null = null;

  constructor(
    private route: ActivatedRoute,
    private pipelineService: PipelineService,
    private jobService: JobService,
    private candidateService: CandidateService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jobId = +params['id'];
      this.loadJobDetails();
      this.loadPipeline();
      this.loadAllCandidates();
    });
  }

  loadJobDetails() {
    this.jobService.getJobById(this.jobId).subscribe(job => {
      this.job = job;
    });
  }

  loadPipeline() {
    this.pipelineService.getJobPipeline(this.jobId).subscribe(data => {
      const stagesMap = new Map<number, StageWithCandidates>();
      
      // Initialize stages
      data.stages.forEach((stage: PipelineStage) => {
        stagesMap.set(stage.id!, {
          ...stage,
          candidates: []
        });
      });

      // Assign candidates to stages
      data.candidates.forEach((candidate: CandidatePipeline) => {
        const stageId = candidate.stage.id!;
        if (stagesMap.has(stageId)) {
          stagesMap.get(stageId)!.candidates.push(candidate);
        }
      });

      this.stages = Array.from(stagesMap.values()).sort((a, b) => a.position - b.position);
      
      // Set default stage to first stage
      if (this.stages.length > 0 && !this.selectedStageId) {
        this.selectedStageId = this.stages[0].id!;
      }

      // Update available candidates
      this.updateAvailableCandidates();
    });
  }

  loadAllCandidates() {
    this.candidateService.getAllCandidates().subscribe(candidates => {
      this.allCandidates = candidates;
      this.updateAvailableCandidates();
    });
  }

  updateAvailableCandidates() {
    // Get all candidate IDs already in this job's pipeline
    const assignedCandidateIds = new Set<number>();
    this.stages.forEach(stage => {
      stage.candidates.forEach(cp => {
        assignedCandidateIds.add(cp.candidate.id);
      });
    });

    // Filter out already assigned candidates
    this.availableCandidates = this.allCandidates.filter(
      candidate => !assignedCandidateIds.has(candidate.id!)
    );
  }

  addCandidateToJob(candidate: Candidate) {
    if (!this.selectedStageId) {
      alert('Please select a stage');
      return;
    }

    console.log('Adding candidate to job:', candidate, 'Stage:', this.selectedStageId);

    this.pipelineService.addCandidateToJob(
      this.jobId,
      candidate.id!,
      this.selectedStageId
    ).subscribe({
      next: () => {
        console.log('Candidate added successfully');
        this.toastService.show('Candidate added to pipeline', 'success');
        this.loadPipeline(); // Refresh the pipeline
        this.showAddCandidateModal = false;
      },
      error: (error) => {
        console.error('Error adding candidate:', error);
        this.toastService.show('Failed to add candidate', 'error');
      }
    });
  }

  getConnectedLists(): string[] {
    return this.stages.map((_, index) => `stage-${index}`);
  }

  drop(event: CdkDragDrop<CandidatePipeline[]>, targetStage: StageWithCandidates) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const candidate = event.previousContainer.data[event.previousIndex];
      
      // Move candidate to new stage via API
      this.pipelineService.moveCandidateToStage(
        candidate.candidate.id,
        this.jobId,
        targetStage.id!
      ).subscribe(() => {
        this.toastService.show(`Moved to ${targetStage.name}`, 'success');
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      });
    }
  }

  openScheduler(candidatePipeline: CandidatePipeline) {
    this.selectedCandidatePipeline = candidatePipeline;
    this.showScheduler = true;
  }

  onInterviewScheduled(interview: any) {
    console.log('Interview scheduled:', interview);
    // Optionally refresh data or show success message
    this.loadPipeline();
  }
}
