import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { PipelineTemplate } from '../../../models/pipeline-template.model';
import { PipelineTemplateService } from '../../../services/pipeline-template.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { PipelineService } from '../../../services/pipeline.service'; // Added
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Candidate } from '../../../models/candidate.model';
import { FileUploadComponent } from '../../../components/shared/file-upload/file-upload.component';
import { ActivityTimelineComponent } from '../../../components/shared/activity-timeline/activity-timeline.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { ImageCropperComponent } from '../../../components/shared/image-cropper/image-cropper.component';
import { HttpClient } from '@angular/common/http';
import { PipelineStage, CandidatePipeline } from '../../../models/pipeline.model'; // Added explicitly if needed
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';
import { TagSelectModalComponent } from '../../../components/shared/tag-select-modal/tag-select-modal.component';
import { Tag } from '../../../models/tag.model';
import { LocationInputComponent } from '../../../components/shared/location-input/location-input.component';
import { InlineEditComponent } from '../../../components/shared/inline-edit/inline-edit.component';
import { ConfirmModalComponent } from '../../../components/shared/confirm-modal/confirm-modal.component';
import { CandidateSelectModalComponent } from '../../../components/shared/candidate-select-modal/candidate-select-modal.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DragDropModule, FileUploadComponent, ActivityTimelineComponent, HasRoleDirective, AvatarComponent, ImageCropperComponent, TagListComponent, TagSelectModalComponent, LocationInputComponent, InlineEditComponent, ConfirmModalComponent, CandidateSelectModalComponent],
  template: `
    <div class="page-container">
      <div *ngIf="job" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div class="flex justify-between items-start gap-4">
            <div class="flex items-center gap-6  flex-1">
              <div class="relative group cursor-pointer" (click)="logoInput.click()">
                <app-avatar 
                  [name]="job.client.name" 
                  [imageUrl]="job.logoUrl || job.client.logoUrl" 
                  [size]="80" 
                  type="job">
                </app-avatar>
                <div class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-white text-[10px] font-bold text-center uppercase tracking-widest px-2">CHANGE LOGO</span>
                </div>
                <input type="file" #logoInput (change)="onLogoFileSelected($event)" class="hidden" accept="image/*">
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                   <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ job.title }}</h1>
                   <span class="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-widest">{{ job.jobCode || 'NO-CODE' }}</span>
                </div>
                <div class="flex items-center gap-6 text-sm text-slate-500">
                  <span *ngIf="job.client" class="flex items-center">
                    <i class="bi bi-building me-2 text-slate-400"></i>
                    <a [routerLink]="['/clients', job.client.id]" class="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-semibold">{{ job.client.name }}</a>
                  </span>
                  <span class="flex items-center"><i class="bi bi-geo-alt me-2 text-slate-400"></i> {{ job.location }}</span>
                  <span class="flex items-center"><i class="bi bi-calendar-event me-2 text-slate-400"></i> Target: {{ job.targetDate || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-4 mt-3">
                   <span class="status-badge" [class.status-open]="job.status === 'OPEN'">
                     {{ job.status }}
                   </span>
                   <div class="h-4 w-px bg-slate-200"></div>
                   <div class="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <i class="bi bi-people me-2"></i> {{ job.headcount }} Opening{{ job.headcount !== 1 ? 's' : '' }}
                   </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
                 <button (click)="openAssignModal()" class="btn-primary text-sm flex items-center gap-2">
                   <i class="bi bi-person-plus"></i> Add Candidate
                 </button>
                 <button (click)="openEditModal()" class="btn-secondary text-sm flex items-center gap-2">
                   <i class="bi bi-pencil"></i> Edit
                 </button>
                 <button *appHasRole="['ADMIN']" (click)="confirmDelete()" class="btn-danger text-sm flex items-center gap-2">
                   <i class="bi bi-trash"></i> Delete
                 </button>
            </div>
          </div>

          <!-- Tags Row -->
          <div class="mt-6 flex items-center gap-2">
            <app-tag-list [tags]="job.tags || []" [editable]="true" (add)="showTagModal = true" (remove)="removeTag($event)"></app-tag-list>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="border-b border-gray-200 px-6 pt-4">
            <nav class="-mb-px flex space-x-8">
              <button (click)="activeTab = 'pipeline'"
                      [class.border-indigo-500]="activeTab === 'pipeline'"
                      [class.text-indigo-600]="activeTab === 'pipeline'"
                      [class.border-transparent]="activeTab !== 'pipeline'"
                      [class.text-slate-500]="activeTab !== 'pipeline'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-kanban me-2"></i> Pipeline
              </button>
              <button (click)="activeTab = 'candidates'"
                      [class.border-indigo-500]="activeTab === 'candidates'"
                      [class.text-indigo-600]="activeTab === 'candidates'"
                      [class.border-transparent]="activeTab !== 'candidates'"
                      [class.text-slate-500]="activeTab !== 'candidates'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-people me-2"></i> Candidates
                <span class="ms-2 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px]">{{ allCandidates.length }}</span>
              </button>
              <button (click)="activeTab = 'overview'"
                      [class.border-indigo-500]="activeTab === 'overview'"
                      [class.text-indigo-600]="activeTab === 'overview'"
                      [class.border-transparent]="activeTab !== 'overview'"
                      [class.text-slate-500]="activeTab !== 'overview'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-file-earmark-text me-2"></i> Summary
              </button>
              <button (click)="activeTab = 'team'"
                      [class.border-indigo-500]="activeTab === 'team'"
                      [class.text-indigo-600]="activeTab === 'team'"
                      [class.border-transparent]="activeTab !== 'team'"
                      [class.text-slate-500]="activeTab !== 'team'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                <i class="bi bi-shield-check me-2"></i> Team
              </button>
              <button (click)="activeTab = 'suggested'"
                      [class.border-indigo-500]="activeTab === 'suggested'"
                      [class.text-indigo-600]="activeTab === 'suggested'"
                      [class.border-transparent]="activeTab !== 'suggested'"
                      [class.text-slate-500]="activeTab !== 'suggested'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                 <i class="bi bi-stars me-2"></i> AI Sourcing
              </button>
              <button (click)="activeTab = 'attachments'"
                      [class.border-indigo-500]="activeTab === 'attachments'"
                      [class.text-indigo-600]="activeTab === 'attachments'"
                      [class.border-transparent]="activeTab !== 'attachments'"
                      [class.text-slate-500]="activeTab !== 'attachments'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                 <i class="bi bi-paperclip me-2"></i> Files
              </button>
              <button (click)="activeTab = 'activities'"
                      [class.border-indigo-500]="activeTab === 'activities'"
                      [class.text-indigo-600]="activeTab === 'activities'"
                      [class.border-transparent]="activeTab !== 'activities'"
                      [class.text-slate-500]="activeTab !== 'activities'"
                      class="pb-4 px-1 border-b-2 font-bold text-[13px] uppercase tracking-wider flex items-center">
                 <i class="bi bi-clock-history me-2"></i> Logs
              </button>
            </nav>
          </div>

          <div class="p-8">
            <!-- Pipeline View -->
            <div *ngIf="activeTab === 'pipeline'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div class="kanban-board w-full overflow-x-auto pb-6">
                 <div class="flex gap-4 min-w-full">
                   <div *ngFor="let stage of pipelineStages" class="kanban-column w-[300px] flex-shrink-0 bg-slate-50 rounded-xl p-4 border border-slate-100">
                     <h3 class="font-extrabold text-[12px] text-slate-400 uppercase tracking-widest mb-4 px-1 flex justify-between items-center">
                       {{ stage.name }}
                       <span class="bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200 text-slate-600">{{ getCandidatesInStage(stage.name).length }}</span>
                     </h3>
                     
                     <div cdkDropList
                          [id]="stage.name"
                          [cdkDropListData]="getCandidatesInStage(stage.name)"
                          [cdkDropListConnectedTo]="getConnectedLists()"
                          (cdkDropListDropped)="drop($event)"
                          class="min-h-[400px] space-y-4">
                       
                       <div *ngFor="let candidate of getCandidatesInStage(stage.name)" 
                            cdkDrag
                            [cdkDragData]="candidate"
                            class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-indigo-200 transition-all group relative">
                         
                         <!-- Quick Actions -->
                         <button (click)="dropCandidate(candidate.id!)" 
                                 class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                 title="Remove from Pipeline">
                             <i class="bi bi-x-circle"></i>
                         </button>

                         <div class="flex items-center gap-3 mb-3">
                            <app-avatar [name]="candidate.firstName + ' ' + candidate.lastName" [size]="32"></app-avatar>
                            <div class="pe-6"> <!-- Add padding to avoid button overlap -->
                               <div class="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                 <a [routerLink]="['/candidates', candidate.id]">{{ candidate.firstName }} {{ candidate.lastName }}</a>
                               </div>
                               <div class="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{{ candidate.currentPosition || 'No Position' }}</div>
                            </div>
                         </div>
                         <div class="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <span class="flex items-center gap-1">
                                <ng-container *ngIf="candidate.rating">
                                    <i *ngFor="let star of [1,2,3,4,5]" 
                                       class="bi" 
                                       [class.bi-star-fill]="star <= candidate.rating"
                                       [class.bi-star]="star > candidate.rating"
                                       [class.text-yellow-400]="star <= candidate.rating"></i>
                                </ng-container>
                                <span *ngIf="!candidate.rating">No Rating</span>
                            </span>
                            <span>{{ candidate.updatedAt | date:'shortDate' }}</span>
                         </div>
                       </div>

                     </div>
                   </div>
                 </div>
               </div>
            </div>

             <!-- Candidates List View -->
             <div *ngIf="activeTab === 'candidates'" class="animate-in fade-in duration-500">
               <div *ngIf="allCandidates.length === 0" class="text-center py-20 text-slate-400 italic">
                  <i class="bi bi-people text-5xl mb-4 block opacity-20"></i>
                  No candidates in the pipeline yet.
               </div>
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div *ngFor="let candidate of allCandidates" class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                      <div class="flex items-center gap-4 mb-4">
                         <app-avatar [name]="candidate.firstName + ' ' + candidate.lastName" [size]="48"></app-avatar>
                         <div>
                            <h3 class="font-bold text-lg text-slate-900 leading-tight">
                              <a [routerLink]="['/candidates', candidate.id]" class="hover:text-indigo-600 transition-colors">
                                {{ candidate.firstName }} {{ candidate.lastName }}
                              </a>
                            </h3>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{{ candidate.currentPosition || 'No Position' }}</p>
                         </div>
                      </div>
                      <div class="space-y-2 mb-5">
                         <p class="text-sm text-slate-600 flex items-center"><i class="bi bi-building me-2 text-slate-400"></i> {{ candidate.currentCompany || 'N/A' }}</p>
                         <p class="text-sm text-slate-600 flex items-center"><i class="bi bi-envelope me-2 text-slate-400"></i> {{ candidate.email }}</p>
                      </div>
                      <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <span class="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">Qualified</span>
                          <div class="flex gap-2">
                              <button (click)="dropCandidate(candidate.id!)" 
                                      class="btn-danger !py-1 !px-3 font-bold text-[10px] uppercase tracking-widest"
                                      title="Remove from pipeline">
                                 <i class="bi bi-person-dash"></i> DROP
                              </button>
                              <a [routerLink]="['/candidates', candidate.id]" class="btn-secondary !py-1 !px-3 !text-[10px] uppercase tracking-widest">Full Profile</a>
                          </div>
                      </div>
                  </div>
               </div>
             </div>

            <!-- Summary Tab -->
            <div *ngIf="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
               <!-- Left Column (Main Info) -->
               <div class="lg:col-span-8 space-y-8">
                  <!-- Job Description Card -->
                  <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                     <h3 class="flex items-center gap-3 text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                        <i class="bi bi-file-text text-indigo-500 text-lg"></i> Job Description
                     </h3>
                     <app-inline-edit [value]="job.description" label="Description" type="textarea" (saveValue)="updateField('description', $event)">
                        <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {{ job.description }}
                        </div>
                     </app-inline-edit>
                  </div>
                  
                  <!-- Requirements Section -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <!-- Experience Card -->
                     <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full hover:border-indigo-100 transition-colors">
                        <div class="flex items-center gap-3 mb-4">
                           <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                              <i class="bi bi-briefcase font-bold text-lg"></i>
                           </div>
                           <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Experience Level</h4>
                        </div>
                        <app-inline-edit [value]="job.experienceRequired" label="Experience" type="number" (saveValue)="updateField('experienceRequired', $event)">
                           <p class="text-slate-900 font-extrabold text-2xl mt-auto">{{ job.experienceRequired }} Years</p>
                        </app-inline-edit>
                     </div>

                     <!-- Skills Card -->
                     <div class="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-sm flex flex-col h-full relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-20 h-20 bg-indigo-100/50 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div class="flex items-center gap-3 mb-4 relative z-10">
                           <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <i class="bi bi-lightning-charge font-bold text-lg"></i>
                           </div>
                           <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Required Skills</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-auto relative z-10">
                           <span *ngFor="let skill of job.skills?.split(',')" class="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 shadow-sm border border-indigo-50">{{ skill.trim() }}</span>
                           <span *ngIf="!job.skills" class="text-indigo-300 italic text-sm">No skills listed</span>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Right Column (Meta Info) -->
               <div class="lg:col-span-4 space-y-6">
                  <!-- Position Details Card -->
                  <div class="bg-white border text-center border-slate-100 rounded-2xl p-6 shadow-sm">
                     <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Position Details</h3>
                     <div class="space-y-6">
                        <div class="flex items-start gap-4">
                           <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-1">
                              <i class="bi bi-clock"></i>
                           </div>
                           <div class="flex-1 text-left">
                              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employment Type</p>
                              <app-inline-edit [value]="job.employmentType" label="Type" type="select" [options]="[
                                  {label: 'Full Time', value: 'FULL_TIME'},
                                  {label: 'Part Time', value: 'PART_TIME'},
                                  {label: 'Contract', value: 'CONTRACT'},
                                  {label: 'Freelance', value: 'FREELANCE'},
                                  {label: 'Internship', value: 'INTERNSHIP'}
                              ]" (saveValue)="updateField('employmentType', $event)">
                                 <p class="text-sm font-bold text-slate-800">{{ job.employmentType?.replace('_', ' ') }}</p>
                              </app-inline-edit>
                           </div>
                        </div>
                        <div class="flex items-start gap-4">
                           <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-1">
                              <i class="bi bi-diagram-3"></i>
                           </div>
                           <div class="flex-1 text-left">
                              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                              <app-inline-edit [value]="job.department" label="Department" (saveValue)="updateField('department', $event)">
                                <p class="text-sm font-bold text-slate-800">{{ job.department }}</p>
                              </app-inline-edit>
                           </div>
                        </div>
                        <div class="flex items-start gap-4">
                           <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mt-1">
                              <i class="bi bi-cash-stack"></i>
                           </div>
                           <div class="flex-1 text-left">
                              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compensation Range</p>
                              <app-inline-edit [value]="job.salaryRange" label="Salary Range" (saveValue)="updateField('salaryRange', $event)">
                                  <p class="text-sm font-bold text-emerald-700" *ngIf="job.salaryMin">
                                     {{ job.salaryMin | currency:job.currency:'symbol':'1.0-0' }} - {{ job.salaryMax | currency:job.currency:'symbol':'1.0-0' }} 
                                  </p>
                                  <p class="text-sm font-bold text-emerald-700" *ngIf="!job.salaryMin">{{ job.salaryRange }}</p>
                              </app-inline-edit>
                           </div>
                        </div>
                        <div class="flex items-start gap-4">
                           <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-1">
                              <i class="bi bi-calendar-check"></i>
                           </div>
                           <div class="flex-1 text-left">
                              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Date</p>
                              <app-inline-edit [value]="job.targetDate" label="Target Date" type="date" (saveValue)="updateField('targetDate', $event)">
                                <p class="text-sm font-bold text-slate-800">{{ job.targetDate }}</p>
                              </app-inline-edit>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <!-- Pipeline Stats Card -->
                  <div class="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                     <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                     <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
                     
                     <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 relative z-10">Pipeline Health</h3>
                     <div class="grid grid-cols-2 gap-4 relative z-10">
                        <div class="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                           <p class="text-3xl font-black text-white mb-1">{{ allCandidates.length }}</p>
                           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Candidates</p>
                        </div>
                        <div class="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                           <p class="text-3xl font-black text-white mb-1">{{ job.headcount }}</p>
                           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Positions</p>
                        </div>
                     </div>
                  </div>

                  <!-- Quick Actions -->
                  <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center">
                     <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                     <button (click)="activeTab = 'suggested'" class="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all text-xs uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                        <i class="bi bi-stars"></i> AI Candidate Search
                     </button>
                     <button (click)="activeTab = 'pipeline'" class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-indigo-700 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <i class="bi bi-kanban"></i> View Kanban Board
                     </button>
                  </div>
               </div>
            </div>

            <!-- Team Tab -->
            <div *ngIf="activeTab === 'team'" class="max-w-4xl mx-auto animate-in fade-in duration-500">
               <div class="flex justify-between items-center mb-8">
                  <div>
                     <h3 class="text-xl font-black text-slate-900">Hiring Team</h3>
                     <p class="text-sm text-slate-500">Collaborators assigned to manage the recruitment for this position.</p>
                  </div>
                  <button (click)="openEditModal()" class="btn-primary text-xs uppercase tracking-widest font-bold px-6">Manage Team</button>
               </div>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div *ngFor="let recruiter of assignedRecruiters" class="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-3xl group hover:border-indigo-200 transition-all">
                     <div class="flex items-center gap-4">
                        <app-avatar [name]="recruiter.firstName + ' ' + recruiter.lastName" [size]="56"></app-avatar>
                        <div>
                           <p class="font-extrabold text-slate-900">{{ recruiter.firstName }} {{ recruiter.lastName }}</p>
                           <p class="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Assigned Recruiter</p>
                           <p class="text-xs text-slate-400 mt-1">{{ recruiter.email }}</p>
                        </div>
                     </div>
                     <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="bi bi-shield-check text-indigo-500 text-xl"></i>
                     </div>
                  </div>
                  
                  <div *ngIf="assignedRecruiters.length === 0" class="col-span-2 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                     <p class="text-slate-400 italic">No recruiters assigned to this job.</p>
                  </div>
               </div>
            </div>

            <!-- Suggested Candidates Tab -->
            <div *ngIf="activeTab === 'suggested'" class="animate-in fade-in duration-500 px-4">
              <div class="flex items-center justify-between mb-10">
                  <div>
                     <h3 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        AI Matching Recommendations <span class="text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Beta</span>
                     </h3>
                     <p class="text-slate-500 mt-2">Cross-referencing candidate skills with job requirements to find the perfect fit.</p>
                  </div>
              </div>

              <div *ngIf="suggestedCandidates.length === 0" class="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i class="bi bi-stars text-3xl text-indigo-400"></i>
                </div>
                <p class="text-slate-500 font-medium">No high-probability matches found in your current talent pool.</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div *ngFor="let rec of suggestedCandidates" 
                     class="relative bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-400 transition-all hover:shadow-xl hover:shadow-indigo-50 group">
                  
                  <div class="absolute -top-3 right-8 bg-white border border-slate-100 shadow-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-sm font-bold text-slate-700">{{ rec.matchScore }}% Match</span>
                  </div>
                  
                  <div class="flex items-center gap-4 mb-8">
                    <app-avatar [name]="rec.candidate.firstName + ' ' + rec.candidate.lastName" [size]="64"></app-avatar>
                    <div>
                      <h3 class="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{{ rec.candidate.firstName }} {{ rec.candidate.lastName }}</h3>
                      <p class="text-sm text-slate-500 font-medium">{{ rec.candidate.currentPosition || 'Candidate' }}</p>
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
                      <span class="flex items-center gap-1.5"><i class="bi bi-geo-alt"></i> {{ rec.candidate.city || 'Remote' }}</span>
                      <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span class="flex items-center gap-1.5"><i class="bi bi-clock"></i> {{ rec.candidate.experienceYears }}y Exp</span>
                    </div>
                  </div>

                  <button class="w-full mt-8 bg-indigo-600 text-white py-3.5 rounded-2xl text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                          (click)="assignCandidate(rec.candidate.id!)">
                    <i class="bi bi-person-plus"></i> Add to pipeline
                  </button>
                </div>
              </div>
            </div>

            <!-- Attachments Tab -->
            <div *ngIf="activeTab === 'attachments'" class="animate-in fade-in duration-500">
                <app-file-upload relatedType="JOB" [relatedId]="jobId"></app-file-upload>
            </div>

            <!-- Notes & Activities Tab -->
            <div *ngIf="activeTab === 'activities'" class="h-[600px] animate-in fade-in duration-500">
                <app-activity-timeline relatedType="JOB" [relatedId]="jobId"></app-activity-timeline>
            </div>

          </div>
        </div>
      </div>

      <app-candidate-select-modal
        *ngIf="showAssignModal"
        [excludeIds]="alreadyAssignedIds"
        (closeParams)="showAssignModal = false"
        (candidatesSelected)="onCandidatesSelected($event)">
      </app-candidate-select-modal>

      <!-- Edit Job Modal -->
      <div *ngIf="showEditModal" class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-content !max-w-3xl !p-10 !rounded-[5px]" (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-10">
               <div>
                  <h2 class="text-3xl font-black text-slate-900 tracking-tight">Edit Job</h2>
                  <p class="text-sm text-slate-500 mt-1">Update core requirements and metadata for this job.</p>
               </div>
               <button (click)="closeEditModal()" class="text-slate-400 hover:text-slate-900 transition-colors text-2xl"><i class="bi bi-x-lg"></i></button>
            </div>
            
            <form (ngSubmit)="updateJob()" #editForm="ngForm">
                <div class="grid grid-cols-12 gap-6">
                   <div class="col-span-8 form-group">
                       <label>Position Title *</label>
                       <input type="text" [(ngModel)]="editJobForm.title" name="title" required class="form-input">
                   </div>
                   <div class="col-span-4 form-group">
                       <label>Job Code</label>
                       <input type="text" [(ngModel)]="editJobForm.jobCode" name="jobCode" class="form-input" placeholder="e.g. ENG-2024-001">
                   </div>
                   
                   <div class="col-span-12 form-group">
                       <label>Job Description</label>
                       <textarea [(ngModel)]="editJobForm.description" name="description" rows="5" class="form-input !rounded-2xl" placeholder="Detailed role description..."></textarea>
                   </div>

                   <div class="col-span-6 form-group">
                       <label>Department</label>
                       <input type="text" [(ngModel)]="editJobForm.department" name="department" class="form-input" placeholder="e.g. Engineering, Sales">
                   </div>
                   <div class="col-span-6 form-group">
                       <label>Employment Type</label>
                       <select [(ngModel)]="editJobForm.employmentType" name="employmentType" class="form-input">
                           <option value="FULL_TIME">Full Time</option>
                           <option value="PART_TIME">Part Time</option>
                           <option value="CONTRACT">Contract</option>
                           <option value="INTERN">Intern</option>
                           <option value="FREELANCE">Freelance</option>
                       </select>
                   </div>

                   <div class="col-span-4 form-group">
                       <label>Headcount</label>
                       <input type="number" [(ngModel)]="editJobForm.headcount" name="headcount" class="form-input" min="1">
                   </div>
                   <div class="col-span-4 form-group">
                       <label>Location</label>
                       <app-location-input 
                         [(ngModel)]="editJobForm.location" 
                         name="location" 
                         placeholder="City, Country">
                       </app-location-input>
                   </div>
                   <div class="col-span-4 form-group">
                       <label>Target Date</label>
                       <input type="date" [(ngModel)]="editJobForm.targetDate" name="targetDate" class="form-input">
                   </div>

                   <div class="col-span-5 form-group">
                       <label>Salary (Min)</label>
                       <input type="number" [(ngModel)]="editJobForm.salaryMin" name="salaryMin" class="form-input">
                   </div>
                   <div class="col-span-5 form-group">
                       <label>Salary (Max)</label>
                       <input type="number" [(ngModel)]="editJobForm.salaryMax" name="salaryMax" class="form-input">
                   </div>
                   <div class="col-span-2 form-group">
                       <label>Currency</label>
                       <input type="text" [(ngModel)]="editJobForm.currency" name="currency" class="form-input" maxlength="3">
                   </div>

                   <div class="col-span-12 form-group">
                       <label>Status</label>
                       <select [(ngModel)]="editJobForm.status" name="status" required class="form-input !bg-slate-50 !border-slate-200">
                           <option value="OPEN">Open (Active Recruitment)</option>
                           <option value="CLOSED">Closed (Hired or Cancelled)</option>
                           <option value="ON_HOLD">On Hold (Pending Approval)</option>
                       </select>
                   </div>
                   
                   <div class="col-span-12 form-group">
                       <label>Skill Keywords (Comma Separated)</label>
                       <input type="text" [(ngModel)]="editJobForm.skills" name="skills" class="form-input" placeholder="Angular, Java, Spring Boot...">
                   </div>

                   <div class="col-span-12 form-group">
                       <label>Assigned Recruiters</label>
                       <select multiple [(ngModel)]="selectedRecruiterIds" name="recruiters" class="form-input !h-32 !rounded-2xl">
                           <option *ngFor="let user of allRecruiters" [value]="user.id">
                               {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
                           </option>
                       </select>
                       <p class="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest"><i class="bi bi-info-circle me-1"></i> Multi-select with CMD/CTRL</p>
                   </div>
                </div>

                <div class="flex gap-4 mt-12">
                    <button type="submit" [disabled]="!editForm.form.valid" class="btn-primary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Update Position</button>
                    <button type="button" (click)="closeEditModal()" class="btn-secondary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Cancel</button>
                </div>
            </form>
        </div>
      </div>

      <app-confirm-modal
        *ngIf="showDropConfirm"
        title="Drop Candidate?"
        message="Are you sure you want to remove this candidate from the pipeline? This action will remove all progress for this job."
        confirmLabel="Yes, Drop Candidate"
        cancelLabel="Keep Candidate"
        (confirmed)="onDropConfirmed()"
        (canceled)="showDropConfirm = false">
      </app-confirm-modal>
    </div>


    <!-- Image Cropper Modal -->
    <app-image-cropper
      *ngIf="showCropper"
      [imageChangedEvent]="imageChangedEvent"
      title="Update Job Logo"
      (cropped)="onImageCropped($event)"
      (cancel)="showCropper = false"
    ></app-image-cropper>

    <app-tag-select-modal *ngIf="showTagModal && job" [selectedTags]="job.tags || []" (close)="showTagModal = false" (tagsChanged)="onTagsChanged($event)"></app-tag-select-modal>
  `,
  styles: [`
    .page-container { 
      padding: 0.5rem; 
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
      width: 100%;
      overflow-x: hidden;
    }
    
    .space-y-6 {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
      width: 100%;
      min-width: 0;
    }

    .bg-white.rounded-lg.shadow-sm {
      width: 100%;
      min-width: 0;
      overflow: hidden;
      box-sizing: border-box;
    }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #f3f4f6;
      color: #374151;
    }
    .status-open {
      background: #d1fae5;
      color: #065f46;
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
      ring: 2px;
      ring-color: rgba(99, 102, 241, 0.2);
    }

    .btn-secondary {
       background: white;
       color: var(--primary-color);
       border: 1px solid #e2e8f0;
       padding: 0.5rem 1rem;
       border-radius: 0.375rem;
       font-weight: 600;
       cursor: pointer;
       transition: all 0.2s;
    }
    .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
    
    .btn-danger {
       background: white;
       color: #ef4444;
       border: 1px solid #fee2e2;
       padding: 0.5rem 1rem;
       border-radius: 0.375rem;
       font-weight: 600;
       cursor: pointer;
    }
    .btn-danger:hover { background: #fef2f2; border-color: #fca5a5; }

    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  pipelineStages: { id: number, name: string, candidates: any[] }[] = []; 
  loading = true;
  jobId!: number;
  activeTab: 'pipeline' | 'candidates' | 'overview' | 'team' | 'suggested' | 'attachments' | 'activities' = 'pipeline';
  
  // Suggested Candidates
  suggestedCandidates: any[] = [];
  allCandidates: any[] = []; // For All Candidates tab

  // Edit Modal
  showEditModal = false;
  editJobForm: Partial<Job> = {};
  allRecruiters: User[] = [];
  assignedRecruiters: User[] = [];
  selectedRecruiterIds: number[] = [];
  showCropper = false;
  imageChangedEvent: any = '';

  // Tag Management
  showTagModal = false;

  // Drop Confirmation
  showDropConfirm = false;
  candidateIdToDrop: number | null = null;

  // Add Candidate
  showAssignModal = false;
  alreadyAssignedIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private pipelineService: PipelineService,
    private userService: UserService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jobId = +params['id'];
      this.loadJob();
      this.loadSuggestions();
    });
  }

  loadJob() {
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.loadPipeline(); // Load pipeline independent of template ID check, as we want actual data
        this.assignedRecruiters = job.recruiters || [];
        this.loadRecruiters();
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  loadPipeline() {
     this.pipelineService.getJobPipeline(this.jobId).subscribe((data: any) => {
         const stagesMap = new Map<number, { id: number, name: string, candidates: any[] }>();
         
         // Initialize stages
         data.stages.forEach((stage: any) => {
             stagesMap.set(stage.id, {
                 id: stage.id,
                 name: stage.name,
                 candidates: []
             });
         });

         // Assign candidates to stages
         this.allCandidates = []; // Reset all candidates list
         data.candidates.forEach((candidateCtx: any) => {
             const stageId = candidateCtx.stage.id;
             if (stagesMap.has(stageId)) {
                 stagesMap.get(stageId)!.candidates.push(candidateCtx.candidate);
             }
             this.allCandidates.push(candidateCtx.candidate);
         });

         this.pipelineStages = Array.from(stagesMap.values());
         // Sort if necessary, assuming backend returns order or we can sort by 'position' if available in future
     });
  }

  dropCandidate(candidateId: number) {
    this.candidateIdToDrop = candidateId;
    this.showDropConfirm = true;
  }

  onDropConfirmed() {
    if (this.candidateIdToDrop) {
        this.pipelineService.removeCandidateFromJob(this.jobId, this.candidateIdToDrop).subscribe({
            next: () => {
                this.toastService.show('Candidate removed from job', 'success');
                this.loadPipeline();
                this.showDropConfirm = false;
                this.candidateIdToDrop = null;
            },
            error: (err) => {
                console.error('Failed to remove from job', err);
                this.toastService.show('Failed to remove from job', 'error');
                this.showDropConfirm = false;
                this.candidateIdToDrop = null;
            }
        });
    }
  }

  openAssignModal() {
    this.alreadyAssignedIds = this.allCandidates.map(c => c.id);
    this.showAssignModal = true;
  }

  onCandidatesSelected(candidates: Candidate[]) {
    this.showAssignModal = false;
    if (this.pipelineStages.length === 0) return;
    const firstStageId = this.pipelineStages[0].id;

    let successCount = 0;
    candidates.forEach(candidate => {
        this.pipelineService.addCandidateToJob(this.jobId, candidate.id!, firstStageId).subscribe({
            next: () => {
                successCount++;
                if (successCount === candidates.length) {
                    this.toastService.show(`Successfully added ${successCount} candidates`, 'success');
                    this.loadPipeline();
                    this.loadSuggestions();
                }
            }
        });
    });
  }

  loadSuggestions() {
      this.jobService.getSuggestedCandidates(this.jobId).subscribe({
          next: (suggestions) => this.suggestedCandidates = suggestions,
          error: (err: any) => console.error('Error loading suggestions', err)
      });
  }

  loadRecruiters(): void {
    this.userService.getAllRecruiters().subscribe(users => {
      this.allRecruiters = users;
    });
  }

  getCandidatesInStage(stageName: string): any[] {
    return this.pipelineStages.find(s => s.name === stageName)?.candidates || [];
  }

  getConnectedLists(): string[] {
    return this.pipelineStages.map(s => s.name);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const candidate = event.item.data;
      const newStageName = event.container.id;
      const newStage = this.pipelineStages.find(s => s.name === newStageName);

      if (newStage && candidate) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );

        this.pipelineService.moveCandidateToStage(candidate.id, this.jobId, newStage.id).subscribe({
          next: () => {
            console.log(`Moved ${candidate.firstName} to ${newStageName}`);
          },
          error: (err) => {
            console.error('Failed to move candidate', err);
            this.loadPipeline(); // Revert on error
          }
        });
      }
    }
  }

  assignCandidate(candidateId: number) {
      if (this.pipelineStages.length === 0) return;
      const firstStageId = this.pipelineStages[0].id;
      
      this.pipelineService.addCandidateToJob(this.jobId, candidateId, firstStageId).subscribe({
          next: () => {
              this.toastService.show('Candidate added to pipeline', 'success');
              this.loadPipeline();
              this.loadSuggestions();
          },
          error: (err: any) => this.toastService.show('Failed to add candidate', 'error')
      });
  }

  // Edit Logic
  openEditModal() {
      if (!this.job) return;
      this.editJobForm = { ...this.job };
      this.selectedRecruiterIds = this.assignedRecruiters.map(u => u.id!);
      this.showEditModal = true;
  }

  closeEditModal() {
      this.showEditModal = false;
  }

  updateJob() {
      if (!this.job) return;
      
      const updatedJob = { ...this.editJobForm } as Job;
      
      this.jobService.updateJob(this.job.id!, updatedJob).subscribe({
          next: (res) => {
              this.job = res;
              
              this.jobService.assignRecruiters(this.job!.id!, this.selectedRecruiterIds).subscribe({
                  next: (updatedJobWithRecruiters) => {
                       this.job = updatedJobWithRecruiters;
                       this.assignedRecruiters = updatedJobWithRecruiters.recruiters || [];
                       this.closeEditModal();
                       this.toastService.show('Job updated successfully', 'success');
                  }
              });
          },
          error: (err: any) => console.error('Failed to update job', err)
      });
  }

  onLogoFileSelected(event: any) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  onImageCropped(base64: string) {
    this.showCropper = false;
    this.uploadLogo(base64);
  }

  uploadLogo(base64: string) {
    fetch(base64)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "job-logo.png", { type: "image/png" });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedType', 'JOB_LOGO');
        formData.append('relatedId', this.job!.id!.toString());

        this.http.post<any>('http://localhost:8080/api/attachments/upload', formData).subscribe(attachment => {
          const logoUrl = `http://localhost:8080/api/attachments/download/${attachment.id}`;
          this.job!.logoUrl = logoUrl;
          this.editJobForm.logoUrl = logoUrl; // Sync with edit form
          this.jobService.updateJob(this.job!.id!, this.job!).subscribe();
        });
      });
  }

  confirmDelete() {
      if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
          this.jobService.deleteJob(this.jobId).subscribe({
              next: () => {
                   this.toastService.show('Job deleted successfully', 'success');
                   this.router.navigate(['/jobs']);
              },
              error: (err) => console.error('Failed to delete job', err)
          });
      }
  }

  onTagsChanged(tags: Tag[]) {
    if (!this.job) return;
    this.job.tags = tags;
    this.jobService.updateJob(this.job.id!, this.job).subscribe();
  }

  removeTag(tag: Tag) {
    if (!this.job || !this.job.tags) return;
    this.job.tags = this.job.tags.filter(t => t.id !== tag.id);
    this.jobService.updateJob(this.job.id!, this.job).subscribe();
  }

  updateField(fieldName: string, value: any) {
    if (!this.job) return;
    const updatedJob = { ...this.job, [fieldName]: value };
    
    // Optimistic update
    (this.job as any)[fieldName] = value;

    this.jobService.updateJob(this.job.id!, updatedJob).subscribe({
      next: () => {
         this.toastService.show('Job updated successfully', 'success');
      },
      error: (err) => {
         console.error('Update failed', err);
         this.toastService.show('Failed to update job', 'error');
         this.loadJob(); // Revert on failure
      }
    });
  }
}
