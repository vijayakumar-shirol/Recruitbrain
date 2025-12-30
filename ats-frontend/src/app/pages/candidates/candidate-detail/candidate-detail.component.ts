import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../services/candidate.service';
import { Candidate } from '../../../models/candidate.model';
import { FileUploadComponent } from '../../../components/shared/file-upload/file-upload.component';
import { ActivityTimelineComponent } from '../../../components/shared/activity-timeline/activity-timeline.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { ImageCropperComponent } from '../../../components/shared/image-cropper/image-cropper.component';
import { DocumentViewerComponent } from '../../../components/shared/document-viewer/document-viewer.component';
import { SendEmailModalComponent } from '../../../components/shared/send-email-modal/send-email-modal.component';
import { InterviewSchedulerComponent } from '../../../components/shared/interview-scheduler/interview-scheduler.component';
import { PipelineService } from '../../../services/pipeline.service';
import { CandidatePipeline } from '../../../models/pipeline.model';
import { HttpClient } from '@angular/common/http';
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';
import { TagSelectModalComponent } from '../../../components/shared/tag-select-modal/tag-select-modal.component';
import { Tag } from '../../../models/tag.model';
import { ToastService } from '../../../services/toast.service';
import { InlineEditComponent } from '../../../components/shared/inline-edit/inline-edit.component';
import { ConfirmModalComponent } from '../../../components/shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    FileUploadComponent, 
    ActivityTimelineComponent, 
    HasRoleDirective, 
    AvatarComponent, 
    ImageCropperComponent, 
    DocumentViewerComponent, 
    SendEmailModalComponent, 
    InterviewSchedulerComponent,
    InterviewSchedulerComponent,
    TagListComponent,
    TagSelectModalComponent,
    InlineEditComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="page-container">
      <div *ngIf="candidate" class="space-y-6">
        <!-- Header Section -->
        <div class="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          <!-- Background Decoration -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0"></div>

          <!-- Left: Identity -->
          <div class="flex gap-6 relative z-10 w-full md:w-auto">
             <div class="relative group cursor-pointer" (click)="profileInput.click()">
                <app-avatar 
                  [name]="candidate!.firstName + ' ' + candidate!.lastName" 
                  [imageUrl]="candidate!.profilePictureUrl" 
                  [size]="100" 
                  type="candidate"
                  class="shadow-xl ring-4 ring-white">
                </app-avatar>
                <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                   <i class="bi bi-camera text-white text-xl"></i>
                </div>
                <input type="file" #profileInput (change)="onProfileFileSelected($event)" class="hidden" accept="image/*">
             </div>
             
             <div class="flex-1">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">{{ candidate!.firstName }} {{ candidate!.lastName }}</h1>
                <p class="text-sm font-semibold text-indigo-600 uppercase tracking-wider mt-1 mb-3">{{ candidate!.currentPosition || 'Open to Work' }}</p>
                
                <div class="flex flex-wrap gap-2">
                   <span *ngIf="candidate!.currentCompany" class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <i class="bi bi-building"></i> {{ candidate!.currentCompany }}
                   </span>
                   <span *ngIf="candidate!.experienceYears" class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <i class="bi bi-briefcase"></i> {{ candidate!.experienceYears }} Yrs Exp
                   </span>
                </div>
                 <!-- Meta Badges (Manatal Style) -->
                 <div class="flex flex-wrap gap-4 text-xs text-slate-500 font-medium mb-3">
                    <span class="flex items-center gap-1" title="Source">
                       <i class="bi bi-link-45deg text-slate-400"></i> {{ candidate!.source || 'Direct' }}
                    </span>
                    <span class="flex items-center gap-1" title="Created Date">
                       <i class="bi bi-calendar3 text-slate-400"></i> Added {{ candidate!.createdAt | date:'mediumDate' }}
                    </span>
                    <span class="flex items-center gap-1" title="Rating">
                       <i class="bi bi-star-fill text-yellow-400"></i> {{ candidate!.rating || '0' }}/5
                    </span>
                 </div>
                 
                 <!-- Tags -->
                 <div class="flex flex-wrap gap-2">
                    <app-tag-list [tags]="candidate.tags || []" [editable]="true" (add)="showTagModal = true" (remove)="removeTag($event)"></app-tag-list>
                 </div>
             </div>
          </div>

          <!-- Middle: Contact Info Grid -->
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full">
              <!-- Email -->
              <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <i class="bi bi-envelope-fill"></i>
                  </div>
                  <div class="overflow-hidden">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                      <p class="text-xs font-bold text-slate-800 truncate select-all" title="{{ candidate.email }}">{{ candidate.email }}</p>
                  </div>
              </div>

              <!-- Phone -->
              <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <i class="bi bi-telephone-fill text-xs"></i>
                  </div>
                  <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p class="text-xs font-bold text-slate-800 select-all">{{ candidate.phone || 'N/A' }}</p>
                  </div>
              </div>

              <!-- LinkedIn -->
              <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
                      <i class="bi bi-linkedin text-xs"></i>
                  </div>
                  <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn</p>
                      <a *ngIf="candidate.linkedinUrl" [href]="candidate.linkedinUrl" target="_blank" class="text-xs font-bold text-blue-600 hover:underline">View Profile</a>
                      <span *ngIf="!candidate.linkedinUrl" class="text-xs font-bold text-slate-400">N/A</span>
                  </div>
              </div>

              <!-- Location/Availability (New) -->
              <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-100 transition-colors">
                      <i class="bi bi-calendar-check text-xs"></i>
                  </div>
                  <div>
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available</p>
                      <p class="text-xs font-bold text-slate-800">{{ candidate.availableFrom ? (candidate.availableFrom | date:'mediumDate') : 'Immediate' }}</p>
                  </div>
              </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex flex-col gap-2 relative z-10 w-full md:w-auto min-w-[140px]">
              <button (click)="openEditModal()" class="btn-primary w-full justify-center !py-2.5 shadow-lg shadow-indigo-100 text-xs uppercase tracking-wider font-bold">
                  <i class="bi bi-pencil me-2"></i> Edit Profile
              </button>
              <button (click)="showSendEmailModal = true" [disabled]="candidate.doNotContact" class="btn-secondary w-full justify-center !py-2.5 text-xs uppercase tracking-wider font-bold">
                  <i class="bi bi-envelope me-2"></i> Send Email
              </button>
              <button *appHasRole="['ADMIN']" (click)="confirmDelete()" class="w-full py-2.5 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest">
                  <i class="bi bi-trash"></i> Delete
              </button>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 pt-4">
            <nav class="-mb-px flex space-x-8">
               <button (click)="activeTab = 'overview'"
                      [class.border-indigo-500]="activeTab === 'overview'"
                      [class.text-indigo-600]="activeTab === 'overview'"
                      [class.border-transparent]="activeTab !== 'overview'"
                      [class.text-gray-500]="activeTab !== 'overview'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-person-vcard me-2"></i> Overview
              </button>
              <button (click)="activeTab = 'pipeline'"
                      [class.border-indigo-500]="activeTab === 'pipeline'"
                      [class.text-indigo-600]="activeTab === 'pipeline'"
                      [class.border-transparent]="activeTab !== 'pipeline'"
                      [class.text-gray-500]="activeTab !== 'pipeline'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-kanban me-2"></i> Jobs
                <span class="ms-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{{ candidatePipelines.length }}</span>
              </button>
              <button (click)="activeTab = 'timeline'"
                      [class.border-indigo-500]="activeTab === 'timeline'"
                      [class.text-indigo-600]="activeTab === 'timeline'"
                      [class.border-transparent]="activeTab !== 'timeline'"
                      [class.text-gray-500]="activeTab !== 'timeline'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-clock-history me-2"></i> History
              </button>
              <button (click)="activeTab = 'documents'"
                      [class.border-indigo-500]="activeTab === 'documents'"
                      [class.text-indigo-600]="activeTab === 'documents'"
                      [class.border-transparent]="activeTab !== 'documents'"
                      [class.text-gray-500]="activeTab !== 'documents'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-paperclip me-2"></i> Attachments
              </button>
              <button (click)="activeTab = 'suggested'"
                      [class.border-indigo-500]="activeTab === 'suggested'"
                      [class.text-indigo-600]="activeTab === 'suggested'"
                      [class.border-transparent]="activeTab !== 'suggested'"
                      [class.text-gray-500]="activeTab !== 'suggested'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-stars me-2"></i> AI Sourcing
              </button>
            </nav>
          </div>

          <div class="p-6 bg-slate-50 min-h-[500px]">
            <!-- Overview Tab (Manatal Dashboard Style) -->
            <div *ngIf="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
               <!-- Left Column: Details & Skills -->
               <div class="lg:col-span-1 space-y-6">
                  <!-- Info Card -->
                  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                     <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Candidate Details</h3>
                     <div class="space-y-4">
                        <div>
                           <label class="text-[10px] uppercase font-bold text-slate-400">Salary Expectations</label>
                           <app-inline-edit [value]="candidate.salaryExpectations" label="Salary" (saveValue)="updateField('salaryExpectations', $event)">
                              <p class="text-sm font-bold text-slate-800">{{ candidate.salaryExpectations }}</p>
                           </app-inline-edit>
                        </div>
                        <div>
                           <label class="text-[10px] uppercase font-bold text-slate-400">Available From</label>
                           <app-inline-edit [value]="candidate.availableFrom" label="Availability" type="date" (saveValue)="updateField('availableFrom', $event)">
                             <p class="text-sm font-bold text-slate-800">{{ candidate.availableFrom ? (candidate.availableFrom | date:'longDate') : 'Immediately' }}</p>
                           </app-inline-edit>
                        </div>
                        <div>
                           <label class="text-[10px] uppercase font-bold text-slate-400">Source</label>
                           <app-inline-edit [value]="candidate.source" label="Source" type="select" [options]="[
                              {label: 'LinkedIn', value: 'LinkedIn'},
                              {label: 'Referral', value: 'Referral'},
                              {label: 'Job Board', value: 'Job Board'},
                              {label: 'Career Page', value: 'Career Page'},
                              {label: 'Direct', value: 'Direct'},
                              {label: 'Agency', value: 'Agency'}
                           ]" (saveValue)="updateField('source', $event)">
                              <p class="text-sm font-bold text-slate-800">{{ candidate.source }}</p>
                           </app-inline-edit>
                        </div>
                        <div>
                            <label class="text-[10px] uppercase font-bold text-slate-400">Created By</label>
                            <p class="text-sm font-bold text-slate-800">System Admin</p>
                        </div>
                     </div>
                  </div>

                  <!-- Skills Card -->
                  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                     <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Skills</h3>
                        <button (click)="openEditModal()" class="text-xs font-bold text-indigo-600 hover:underline">Edit</button>
                     </div>
                     <div class="flex flex-wrap gap-2">
                        <span *ngFor="let skill of getSkillsArray()" class="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold border border-slate-200">
                           {{ skill }}
                        </span>
                        <span *ngIf="!candidate.skills" class="text-slate-300 italic text-xs">No skills listed</span>
                     </div>
                  </div>


               </div>

               <!-- Right Column: Resume & Notes -->
               <div class="lg:col-span-2 space-y-6">
                   <!-- Notes Card -->
                   <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Internal Notes</h3>
                      <app-inline-edit [value]="candidate.notes" label="Note" type="textarea" (saveValue)="updateField('notes', $event)">
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 whitespace-pre-wrap font-medium">
                            {{ candidate.notes }}
                        </div>
                      </app-inline-edit>
                   </div>
                   
                   <!-- Resume Preview (If exists) -->
                   <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resume Preview</h3>
                      <div class="text-center py-20 bg-slate-50 rounded border border-dashed border-slate-200" *ngIf="true"> <!-- Placeholder logic for resume checking -->
                         <i class="bi bi-file-earmark-pdf text-4xl text-slate-300 mb-2 block"></i>
                         <p class="text-slate-400 text-sm font-medium">Resume viewing coming soon.</p>
                         <button (click)="activeTab = 'documents'" class="text-indigo-600 text-xs font-bold mt-2 hover:underline">Go to Attachments</button>
                      </div>
                   </div>
               </div>
            </div>

            <!-- Pipeline Tab -->
            <div *ngIf="activeTab === 'pipeline'" class="animate-in fade-in duration-300">
              <div *ngIf="candidatePipelines.length === 0" class="text-center py-12">
                <i class="bi bi-briefcase text-4xl text-gray-200 mb-3 block"></i>
                <p class="text-gray-500 italic">Not applied to any active jobs.</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let cp of candidatePipelines" class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-bold text-gray-900 leading-tight">{{ cp.job.title }}</h4>
                    <span class="status-badge" [style.background-color]="cp.stage.color + '15'" [style.color]="cp.stage.color">
                      {{ cp.stage.name }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4">{{ cp.job.client.name }}</p>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Match Score</span>
                      <span class="text-lg font-bold text-indigo-600">{{ cp.matchScore }}%</span>
                    </div>
                    <div class="flex gap-2">
                        <button (click)="openInterviewScheduler(cp)" 
                                class="btn-primary text-xs px-3 py-2 flex items-center gap-2">
                          <i class="bi bi-calendar-plus"></i>
                        </button>
                        <button (click)="dropJob(cp.job.id!)" 
                                class="btn-danger text-xs px-3 py-2 flex items-center gap-2"
                                title="Remove from this job">
                          <i class="bi bi-person-x"></i>
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Tab -->
            <div *ngIf="activeTab === 'timeline'" class="h-[600px] bg-white rounded-xl p-6 border border-slate-200 animate-in fade-in duration-300">
              <app-activity-timeline relatedType="CANDIDATE" [relatedId]="candidateId"></app-activity-timeline>
            </div>

            <!-- AI Sourcing Tab -->
            <div *ngIf="activeTab === 'suggested'" class="animate-in fade-in duration-300 px-4">
              <div class="flex items-center justify-between mb-10">
                  <div>
                     <h3 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        AI Job Recommendations <span class="text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Beta</span>
                     </h3>
                     <p class="text-slate-500 mt-2">Matching your skills with active job requirements to find the best career path.</p>
                  </div>
              </div>

              <div *ngIf="suggestedJobs.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="bi bi-stars text-3xl text-indigo-400"></i>
                </div>
                <p class="text-slate-500 font-medium">No high-probability matches found in the current job openings.</p>
                <p class="text-slate-400 text-sm mt-1">Try updating candidate skills to improve matching results.</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div *ngFor="let rec of suggestedJobs" 
                     class="relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-400 transition-all hover:shadow-xl hover:shadow-indigo-50 group">
                  
                  <div class="absolute -top-3 right-8 bg-white border border-slate-100 shadow-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-sm font-bold text-slate-700">{{ rec.matchScore }}% Match</span>
                  </div>
                  
                  <div class="flex items-center gap-4 mb-8">
                    <app-avatar [name]="rec.job.client.name" [imageUrl]="rec.job.logoUrl" [size]="64" type="job"></app-avatar>
                    <div>
                      <h3 class="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{{ rec.job.title }}</h3>
                      <p class="text-sm text-slate-500 font-medium">{{ rec.job.client.name }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-6">
                    <div>
                      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Matching Skills</div>
                      <div class="flex flex-wrap gap-1.5">
                        <span *ngFor="let skill of rec.matchingSkills" 
                              class="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-lg border border-indigo-100/50">
                          {{ skill }}
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 text-sm text-slate-500">
                      <span class="flex items-center gap-1.5"><i class="bi bi-geo-alt"></i> {{ rec.job.location }}</span>
                    </div>
                  </div>

                  <button class="w-full mt-8 bg-indigo-600 text-white py-3.5 rounded-2xl text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                          (click)="assignToJob(rec.job.id!)">
                    <i class="bi bi-plus-lg"></i> Apply for position
                  </button>
                </div>
              </div>
            </div>

            <!-- Documents Tab -->
            <div *ngIf="activeTab === 'documents'" class="bg-white rounded-xl p-6 border border-slate-200 animate-in fade-in duration-300">
              <app-file-upload 
                relatedType="CANDIDATE" 
                [relatedId]="candidateId"
                (quickView)="openDocumentViewer($event)">
              </app-file-upload>
            </div>
          </div>
        </div>
      </div>

      <!-- No Candidate State -->
      <div *ngIf="!candidate && !loading" class="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <i class="bi bi-person-x text-5xl text-gray-300 mb-4 block"></i>
        <p class="text-xl font-bold text-gray-400">Candidate not found.</p>
        <a routerLink="/candidates" class="mt-4 text-indigo-600 font-bold hover:underline">Return to candidate list</a>
      </div>
      
      <!-- Specialized Modals -->
      <div *ngIf="showEditModal" class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-content !max-w-4xl" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-black mb-6">Edit Candidate</h2>
          <form (ngSubmit)="updateCandidate()" #editForm="ngForm">
            <div class="grid grid-cols-12 gap-6">
              <!-- Personal Info -->
              <div class="col-span-12 md:col-span-6 form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="editCandidateForm.firstName" name="firstName" required class="form-input">
              </div>
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="editCandidateForm.lastName" name="lastName" required class="form-input">
              </div>
              
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Email Address *</label>
                <input type="email" [(ngModel)]="editCandidateForm.email" name="email" required class="form-input">
              </div>
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Phone Number</label>
                <input type="tel" [(ngModel)]="editCandidateForm.phone" name="phone" class="form-input">
              </div>

              <!-- Professional Info -->
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Current Company</label>
                <input type="text" [(ngModel)]="editCandidateForm.currentCompany" name="company" class="form-input">
              </div>
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Current Position</label>
                <input type="text" [(ngModel)]="editCandidateForm.currentPosition" name="position" class="form-input">
              </div>
              
              <div class="col-span-6 md:col-span-4 form-group">
                <label>Experience (Years)</label>
                <input type="number" [(ngModel)]="editCandidateForm.experienceYears" name="experience" class="form-input">
              </div>
              <div class="col-span-6 md:col-span-4 form-group">
                 <label>Rating (0-5)</label>
                 <input type="number" [(ngModel)]="editCandidateForm.rating" name="rating" min="0" max="5" class="form-input">
              </div>
              <div class="col-span-12 md:col-span-4 form-group">
                <label>Available From</label>
                <input type="date" [(ngModel)]="editCandidateForm.availableFrom" name="availableFrom" class="form-input">
              </div>
              
              <div class="col-span-12 md:col-span-6 form-group">
                <label>Salary Expectations</label>
                <input type="text" [(ngModel)]="editCandidateForm.salaryExpectations" name="salary" class="form-input" placeholder="e.g. $100k - $120k">
              </div>
               <div class="col-span-12 md:col-span-6 form-group">
                <label>Source</label>
                <select [(ngModel)]="editCandidateForm.source" name="source" class="form-input">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Job Board">Job Board</option>
                    <option value="Career Page">Career Page</option>
                    <option value="Direct">Direct Sourcing</option>
                    <option value="Agency">Agency</option>
                </select>
              </div>

              <div class="col-span-12 form-group">
                <label>LinkedIn URL</label>
                <input type="url" [(ngModel)]="editCandidateForm.linkedinUrl" name="linkedin" class="form-input">
              </div>

              <div class="col-span-12 form-group">
                <label>Skills (comma separated)</label>
                <textarea [(ngModel)]="editCandidateForm.skills" name="skills" rows="2" class="form-input"></textarea>
              </div>

               <div class="col-span-12 form-group">
                <label>Internal Notes</label>
                <textarea [(ngModel)]="editCandidateForm.notes" name="notes" rows="4" class="form-input"></textarea>
              </div>

              <div class="col-span-12">
                  <div class="flex items-center gap-2">
                      <input type="checkbox" [(ngModel)]="editCandidateForm.doNotContact" name="doNotContact" id="dnc">
                      <label for="dnc" class="!mb-0 !text-slate-900 cursor-pointer">Do Not Contact</label>
                  </div>
              </div>
            </div>
            
            <div class="flex gap-3 mt-8 pt-6 border-t border-slate-100">
              <button type="submit" [disabled]="!editForm.form.valid" class="btn-primary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Save Updates</button>
              <button type="button" (click)="closeEditModal()" class="btn-secondary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      
      <app-image-cropper *ngIf="showCropper" [imageChangedEvent]="imageChangedEvent" title="Update Profile Picture" (cropped)="onImageCropped($event)" (cancel)="showCropper = false"></app-image-cropper>
      <app-document-viewer *ngIf="showDocumentViewer" [document]="selectedDocument" (closed)="closeDocumentViewer()"></app-document-viewer>
      <app-send-email-modal *ngIf="showSendEmailModal" [candidate]="candidate" (close)="showSendEmailModal = false" (sent)="showSendEmailModal = false"></app-send-email-modal>
      <app-interview-scheduler *ngIf="showInterviewScheduler" [candidatePipelineId]="selectedPipelineForInterview?.id!" [candidateName]="candidate?.firstName + ' ' + candidate?.lastName" [jobTitle]="selectedPipelineForInterview?.job?.title || ''" (close)="showInterviewScheduler = false" (scheduled)="onInterviewScheduled($event)"></app-interview-scheduler>
      
      <app-tag-select-modal *ngIf="showTagModal && candidate" [selectedTags]="candidate.tags || []" (close)="showTagModal = false" (tagsChanged)="onTagsChanged($event)"></app-tag-select-modal>
      
      <app-confirm-modal
        *ngIf="showDropConfirm"
        title="Unassign Job?"
        message="Are you sure you want to remove this candidate from this job pipeline? This cannot be undone."
        confirmLabel="Yes, Remove"
        cancelLabel="Keep Assigned"
        (confirmed)="onDropConfirmed()"
        (canceled)="showDropConfirm = false">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    .page-container { padding: 0.5rem; position: relative; min-height: 100vh; }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary {
       background: white;
       color: var(--primary-color);
       border: 1px solid var(--primary-color);
       padding: 0.5rem 1rem;
       border-radius: 0.375rem;
       font-weight: 500;
       cursor: pointer;
       transition: all 0.2s;
    }
    .btn-secondary:hover { background: #f5f3ff; }

    .btn-danger {
       background: white;
       color: #dc2626;
       border: 1px solid #dc2626;
       padding: 0.5rem 1rem;
       border-radius: 0.375rem;
       font-weight: 500;
       cursor: pointer;
       transition: all 0.2s;
    }
    .btn-danger:hover { background: #fef2f2; }
    
    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover { background: var(--primary-hover-color); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

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
      z-index: 100;
    }
    .modal-content {
      background: white;
      border-radius: 5px;
      padding: 2rem;
      max-width: 600px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
    .form-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }
    .form-input:focus { outline: none; border-color: var(--primary-color); ring: 2px; ring-color: #e0e7ff; }
  `]
})
export class CandidateDetailComponent implements OnInit {
  candidate: Candidate | null = null;
  loading = true;
  candidateId!: number;
  activeTab: 'overview' | 'pipeline' | 'timeline' | 'documents' | 'suggested' = 'overview';

  // Suggested Jobs
  suggestedJobs: any[] = [];

  // Edit Modal
  showEditModal = false;
  editCandidateForm: Partial<Candidate> = {};
  showCropper = false;
  imageChangedEvent: any = '';

  // Document Viewer
  showDocumentViewer = false;
  selectedDocument: any = null;

  // Send Email Modal
  showSendEmailModal = false;

  // Pipeline context for interviewing
  candidatePipelines: CandidatePipeline[] = [];
  showInterviewScheduler = false;
  selectedPipelineForInterview: CandidatePipeline | null = null;
  loadingCandidatePipelines = false;

  // Tag Management
  showTagModal = false;

  // Drop Confirmation
  showDropConfirm = false;
  jobIdToDrop: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candidateService: CandidateService,
    private http: HttpClient,
    private pipelineService: PipelineService,
    private toastService: ToastService
  ) {}


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.candidateId = +params['id'];
      this.loadCandidate();
      this.loadCandidatePipelines();
      this.loadRecommendations();
    });
  }

  loadRecommendations() {
    this.candidateService.getRecommendations(this.candidateId).subscribe({
      next: (recs) => this.suggestedJobs = recs,
      error: (err) => console.error('Failed to load recommendations', err)
    });
  }

  loadCandidate() {
    this.candidateService.getCandidateById(this.candidateId).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.loading = false;
        this.editCandidateForm = { ...candidate };
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadCandidatePipelines() {
    this.loadingCandidatePipelines = true;
    this.pipelineService.getCandidatePipelines(this.candidateId).subscribe({
      next: (pipelines) => {
        this.candidatePipelines = pipelines;
        this.loadingCandidatePipelines = false;
      },
      error: (err) => {
        console.error('Failed to load candidate pipelines', err);
        this.loadingCandidatePipelines = false;
      }
    });
  }

  dropJob(jobId: number) {
    this.jobIdToDrop = jobId;
    this.showDropConfirm = true;
  }

  onDropConfirmed() {
    if (this.jobIdToDrop) {
        this.pipelineService.removeCandidateFromJob(this.jobIdToDrop, this.candidateId).subscribe({
            next: () => {
                this.toastService.show('Candidate removed from job', 'success');
                this.loadCandidatePipelines();
                this.showDropConfirm = false;
                this.jobIdToDrop = null;
            },
            error: (err) => {
                console.error('Failed to remove from job', err);
                this.toastService.show('Failed to remove from job', 'error');
                this.showDropConfirm = false;
                this.jobIdToDrop = null;
            }
        });
    }
  }

  assignToJob(jobId: number) {
    this.pipelineService.assignCandidateToJob(jobId, this.candidateId).subscribe({
      next: () => {
        this.toastService.show('Applied successfully', 'success');
        this.loadCandidatePipelines();
        this.loadRecommendations();
      },
      error: (err) => {
        console.error('Failed to apply', err);
        this.toastService.show('Failed to apply', 'error');
      }
    });
  }

  // Interviewing
  openInterviewScheduler(pipeline: CandidatePipeline) {
    this.selectedPipelineForInterview = pipeline;
    this.showInterviewScheduler = true;
  }

  onInterviewScheduled(interview: any) {
    console.log('Interview scheduled:', interview);
    // Optionally refresh activity timeline to show new interview
  }

  getSkillsArray(): string[] {
    if (!this.candidate?.skills) return [];
    return this.candidate.skills.split(',').map(s => s.trim());
  }

  // Edit Logic
  openEditModal() {
      this.editCandidateForm = { ...this.candidate! };
      this.showEditModal = true;
  }

  closeEditModal() {
      this.showEditModal = false;
  }

  updateCandidate() {
    if (this.candidate) {
      const updatedCandidate = { ...this.editCandidateForm } as Candidate;
      this.candidateService.updateCandidate(this.candidate.id!, updatedCandidate).subscribe(() => {
        this.showEditModal = false;
        this.toastService.show('Candidate updated successfully', 'success');
        this.loadCandidate(); // Reload candidate to reflect changes
      },
      (err) => console.error('Failed to update candidate', err));
    }
  }

  onProfileFileSelected(event: any) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  onImageCropped(base64: string) {
    this.showCropper = false;
    // Upload the cropped image
    this.uploadAvatar(base64);
  }

  uploadAvatar(base64: string) {
    // Convert base64 to file
    fetch(base64)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "avatar.png", { type: "image/png" });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedType', 'CANDIDATE_AVATAR'); // Specific type for avatars
        formData.append('relatedId', this.candidate!.id!.toString());

        this.http.post<any>('http://localhost:8080/api/attachments/upload', formData).subscribe(attachment => {
          // Update candidate with the server URL
          // For now, let's use a standard download URL format
          const avatarUrl = `http://localhost:8080/api/attachments/download/${attachment.id}`;
          this.candidate!.profilePictureUrl = avatarUrl;
          this.editCandidateForm.profilePictureUrl = avatarUrl; // Sync with edit form
          this.candidateService.updateCandidate(this.candidate!.id!, this.candidate!).subscribe({
            next: () => {
              // Avatar updated successfully, no need to reload full candidate if only avatar changed
              this.toastService.show('Profile picture updated successfully', 'success');
              // If other data might be affected, call this.loadCandidate();
            },
            error: (err) => console.error('Failed to update candidate avatar URL', err)
          });
        },
        (err) => console.error('Failed to upload avatar file', err));
      });
  }

  // Delete Logic
  confirmDelete() {
      if (confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
          this.candidateService.deleteCandidate(this.candidateId).subscribe({
              next: () => {
                   this.toastService.show('Candidate deleted successfully', 'success');
                   this.router.navigate(['/candidates']);
              },
              error: (err) => console.error('Failed to delete candidate', err)
          });
      }
  }

  // Document Viewer
  openDocumentViewer(document: any) {
    this.selectedDocument = document;
    this.showDocumentViewer = true;
  }

  updateField(fieldName: string, value: any) {
    if (!this.candidate) return;
    const updatedCandidate = { ...this.candidate, [fieldName]: value };
    
    // Optimistic update
    (this.candidate as any)[fieldName] = value;

    this.candidateService.updateCandidate(this.candidateId, updatedCandidate).subscribe({
      next: () => {
         this.toastService.show('Candidate updated', 'success');
      },
      error: (err) => {
         console.error('Update failed', err);
         this.toastService.show('Failed to update candidate', 'error');
         this.loadCandidate(); // Revert on failure
      }
    });
  }

  closeDocumentViewer() {
    this.showDocumentViewer = false;
    this.selectedDocument = null;
  }

  onTagsChanged(tags: Tag[]) {
    if (!this.candidate) return;
    this.candidate.tags = tags;
    this.candidateService.updateCandidate(this.candidateId, this.candidate).subscribe();
  }

  removeTag(tag: Tag) {
    if (!this.candidate || !this.candidate.tags) return;
    this.candidate.tags = this.candidate.tags.filter(t => t.id !== tag.id);
    this.candidateService.updateCandidate(this.candidateId, this.candidate).subscribe();
  }
}
