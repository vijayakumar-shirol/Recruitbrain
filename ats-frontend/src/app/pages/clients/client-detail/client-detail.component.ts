import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { JobService } from '../../../services/job.service';
import { Client } from '../../../models/client.model';
import { Job } from '../../../models/job.model';
import { ActivityTimelineComponent } from '../../../components/shared/activity-timeline/activity-timeline.component';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { AvatarComponent } from '../../../components/shared/avatar/avatar.component';
import { ImageCropperComponent } from '../../../components/shared/image-cropper/image-cropper.component';
import { HttpClient } from '@angular/common/http';
import { TagListComponent } from '../../../components/shared/tag-list/tag-list.component';
import { TagSelectModalComponent } from '../../../components/shared/tag-select-modal/tag-select-modal.component';
import { LocationInputComponent } from '../../../components/shared/location-input/location-input.component';
import { Tag } from '../../../models/tag.model';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { ToastService } from '../../../services/toast.service';
import { InlineEditComponent } from '../../../components/shared/inline-edit/inline-edit.component';
import { PipelineTemplateService } from '../../../services/pipeline-template.service';
import { PipelineTemplate } from '../../../models/pipeline-template.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    ActivityTimelineComponent, 
    HasRoleDirective, 
    AvatarComponent, 
    ImageCropperComponent, 
    TagListComponent, 
    TagSelectModalComponent,
    LocationInputComponent,
    InlineEditComponent
  ],
  template: `
    <div class="page-container">
      <div *ngIf="client" class="space-y-6">
        <!-- Client Header Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-start gap-4">
            <div class="flex items-center gap-6 min-w-0 flex-1">
              <div class="relative group cursor-pointer" (click)="logoInput.click()">
                <app-avatar 
                  [name]="client.name" 
                  [imageUrl]="client.logoUrl" 
                  [size]="80" 
                  type="client">
                </app-avatar>
                <div class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-white text-xs font-bold font-sans text-center uppercase tracking-tighter">CHANGE LOGO</span>
                </div>
                <input type="file" #logoInput (change)="onLogoFileSelected($event)" class="hidden" accept="image/*">
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ client.name }}</h1>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span class="flex items-center"><i class="bi bi-building me-2 text-gray-400"></i> {{ client.industry || 'No Industry' }}</span>
                  <span class="flex items-center" *ngIf="client.website">
                    <i class="bi bi-globe me-2 text-gray-400"></i> 
                    <a [href]="client.website.startsWith('http') ? client.website : 'https://' + client.website" target="_blank" class="text-indigo-600 hover:underline">
                      {{ client.website }}
                    </a>
                  </span>
                  <span class="flex items-center"><i class="bi bi-geo-alt me-2 text-gray-400"></i> {{ client.city }}{{ client.city && client.country ? ', ' : '' }}{{ client.country || (client.city ? '' : 'No Location') }}</span>
                </div>
                <div class="flex items-center gap-4 mt-2">
                  <span class="status-badge" 
                        [class.active]="client.status === 'ACTIVE'"
                        [class.prospect]="client.status === 'PROSPECT'"
                        [class.inactive]="client.status === 'INACTIVE'">
                    {{ client.status }}
                  </span>
                  <div class="h-4 w-px bg-gray-200"></div>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">OWNER: {{ client.owner?.firstName ? client.owner.firstName + ' ' + client.owner.lastName : (client.owner?.username || 'Unassigned') }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button (click)="showAddJobModal = true" class="btn-primary text-sm flex items-center">
                <i class="bi bi-plus-lg me-2"></i> Add Job
              </button>
              <button (click)="openEditModal()" class="btn-secondary text-sm flex items-center">
                <i class="bi bi-pencil me-2 text-gray-400"></i> Edit
              </button>
              <button *appHasRole="['ADMIN']" (click)="confirmDelete()" class="btn-danger text-sm flex items-center">
                <i class="bi bi-trash me-2"></i> Delete
              </button>
            </div>
          </div>

          <!-- Tags Row -->
          <div class="mt-6 flex items-center gap-2">
            <app-tag-list [tags]="client.tags || []" [editable]="true" (add)="showTagModal = true" (remove)="removeTag($event)"></app-tag-list>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="border-b border-gray-200 px-6 pt-4">
            <nav class="-mb-px flex space-x-8">
              <button (click)="activeTab = 'overview'"
                      [class.border-indigo-500]="activeTab === 'overview'"
                      [class.text-indigo-600]="activeTab === 'overview'"
                      [class.border-transparent]="activeTab !== 'overview'"
                      [class.text-gray-500]="activeTab !== 'overview'"
                      class="pb-4 px-1 border-b-2 font-medium text-sm flex items-center">
                <i class="bi bi-info-circle me-2"></i> Summary
              </button>
              <button (click)="activeTab = 'jobs'"
                      [class.border-indigo-500]="activeTab === 'jobs'"
                      [class.text-indigo-600]="activeTab === 'jobs'"
                      [class.border-transparent]="activeTab !== 'jobs'"
                      [class.text-gray-500]="activeTab !== 'jobs'"
                      class="pb-4 px-1 border-b-2 font-medium text-sm flex items-center">
                <i class="bi bi-briefcase me-2"></i> Jobs
                <span class="ms-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">{{ jobs.length }}</span>
              </button>
              <button (click)="activeTab = 'contacts'"
                      [class.border-indigo-500]="activeTab === 'contacts'"
                      [class.text-indigo-600]="activeTab === 'contacts'"
                      [class.border-transparent]="activeTab !== 'contacts'"
                      [class.text-gray-500]="activeTab !== 'contacts'"
                      class="pb-4 px-1 border-b-2 font-medium text-sm flex items-center">
                <i class="bi bi-people me-2"></i> Contacts
              </button>
              <button (click)="activeTab = 'notes'"
                      [class.border-indigo-500]="activeTab === 'notes'"
                      [class.text-indigo-600]="activeTab === 'notes'"
                      [class.border-transparent]="activeTab !== 'notes'"
                      [class.text-gray-500]="activeTab !== 'notes'"
                      class="pb-4 px-1 border-b-2 font-medium text-sm flex items-center">
                <i class="bi bi-clock-history me-2"></i> Notes & Activities
              </button>
              <button (click)="activeTab = 'team'"
                      [class.border-indigo-500]="activeTab === 'team'"
                      [class.text-indigo-600]="activeTab === 'team'"
                      [class.border-transparent]="activeTab !== 'team'"
                      [class.text-gray-500]="activeTab !== 'team'"
                      class="pb-4 px-1 border-b-2 font-medium text-sm flex items-center">
                <i class="bi bi-shield-check me-2"></i> Team
              </button>
            </nav>
          </div>

          <div class="p-6">
            <!-- Summary Tab -->
            <div *ngIf="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-8">
                <div class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Organization Information</h3>
                  </div>
                  <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <i class="bi bi-person-badge"></i>
                        </div>
                        <label class="info-label !mb-0">Main Contact</label>
                      </div>
                      <app-inline-edit [value]="client.contactPerson" label="Contact Person" (saveValue)="updateField('contactPerson', $event)">
                         <p class="info-value pl-11">{{ client.contactPerson || 'Not Set' }}</p>
                      </app-inline-edit>
                    </div>

                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <i class="bi bi-envelope"></i>
                        </div>
                        <label class="info-label !mb-0">Email</label>
                      </div>
                      <app-inline-edit [value]="client.email" label="Email" type="email" (saveValue)="updateField('email', $event)">
                        <p class="info-value pl-11 text-indigo-600 font-medium">{{ client.email || 'Not Set' }}</p>
                      </app-inline-edit>
                    </div>

                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                          <i class="bi bi-telephone"></i>
                        </div>
                        <label class="info-label !mb-0">Phone</label>
                      </div>
                      <app-inline-edit [value]="client.phone" label="Phone" type="tel" (saveValue)="updateField('phone', $event)">
                        <p class="info-value pl-11">{{ client.phone || 'Not Set' }}</p>
                      </app-inline-edit>
                    </div>

                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                          <i class="bi bi-building"></i>
                        </div>
                        <label class="info-label !mb-0">Industry</label>
                      </div>
                      <app-inline-edit [value]="client.industry" label="Industry" (saveValue)="updateField('industry', $event)">
                        <p class="info-value pl-11">{{ client.industry || 'Not Set' }}</p>
                      </app-inline-edit>
                    </div>

                    <div class="info-item md:col-span-2">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                          <i class="bi bi-geo-alt"></i>
                        </div>
                        <label class="info-label !mb-0">Full Address</label>
                      </div>
                      <app-inline-edit [value]="client.address" label="Address" (saveValue)="updateField('address', $event)">
                        <p class="info-value pl-11">{{ client.address }}{{ client.city ? ', ' + client.city : '' }}{{ client.country ? ', ' + client.country : '' }}</p>
                      </app-inline-edit>
                    </div>

                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                          <i class="bi bi-globe"></i>
                        </div>
                        <label class="info-label !mb-0">Website</label>
                      </div>
                      <app-inline-edit [value]="client.website" label="Website" type="url" (saveValue)="updateField('website', $event)">
                        <a [href]="client.website" target="_blank" class="text-indigo-600 hover:underline block truncate pl-11">{{ client.website || 'Not Set' }}</a>
                      </app-inline-edit>
                    </div>

                    <div class="info-item">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                          <i class="bi bi-linkedin"></i>
                        </div>
                        <label class="info-label !mb-0">LinkedIn</label>
                      </div>
                      <app-inline-edit [value]="client.linkedinUrl" label="LinkedIn URL" type="url" (saveValue)="updateField('linkedinUrl', $event)">
                         <a *ngIf="client.linkedinUrl" [href]="client.linkedinUrl" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1 pl-11">
                            View Profile
                         </a>
                         <p *ngIf="!client.linkedinUrl" class="info-value pl-11">Not Set</p>
                      </app-inline-edit>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <!-- Quick Stats Card -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Statistics</h3>
                  </div>
                  <div class="p-6 space-y-5">
                    <div class="flex justify-between items-center group">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                          <i class="bi bi-briefcase"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-600">Total Positions</span>
                      </div>
                      <span class="text-lg font-black text-slate-900 tracking-tight">{{ jobs.length }}</span>
                    </div>

                    <div class="flex justify-between items-center group">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                          <i class="bi bi-record-circle"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-600">Active Pipeline</span>
                      </div>
                      <span class="text-lg font-black text-emerald-600 tracking-tight">{{ openJobsCount }}</span>
                    </div>

                    <div class="flex justify-between items-center group">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
                          <i class="bi bi-archive"></i>
                        </div>
                        <span class="text-sm font-medium text-gray-600">Closed/Filled</span>
                      </div>
                      <span class="text-lg font-black text-slate-400 tracking-tight">{{ closedJobsCount }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Account Management Card -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-50 bg-indigo-50/30">
                    <h3 class="text-xs font-bold text-indigo-500 uppercase tracking-widest">Internal Assignment</h3>
                  </div>
                  <div class="p-6">
                    <div class="flex items-center gap-4" *ngIf="client.owner">
                      <app-avatar 
                        [name]="client.owner.firstName + ' ' + client.owner.lastName" 
                        [size]="48"
                        class="ring-2 ring-indigo-50 ring-offset-2">
                      </app-avatar>
                      <div>
                        <p class="text-[13px] font-bold text-slate-900">{{ client.owner.firstName }} {{ client.owner.lastName }}</p>
                        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Account Manager</p>
                        <div class="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer">
                          <i class="bi bi-envelope-at"></i>
                          <span>Send Message</span>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="!client.owner" class="flex flex-col items-center py-4">
                      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                        <i class="bi bi-person-x text-xl"></i>
                      </div>
                      <p class="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Unassigned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Jobs Tab -->
            <div *ngIf="activeTab === 'jobs'">
              <div *ngIf="jobs.length === 0" class="text-center py-12">
                <i class="bi bi-briefcase text-4xl text-gray-200 mb-3 block"></i>
                <p class="text-gray-500 italic">No jobs found for this client.</p>
                <a routerLink="/candidates" class="mt-4 btn-primary inline-flex items-center">
                   <i class="bi bi-plus-lg me-2"></i> Create First Job
                </a>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div *ngFor="let job of jobs" class="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      <a [routerLink]="['/jobs', job.id]">{{ job.title }}</a>
                    </h4>
                    <span class="status-badge active" *ngIf="job.status === 'OPEN'">Open</span>
                    <span class="status-badge inactive" *ngIf="job.status !== 'OPEN'">{{ job.status }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4 flex items-center"><i class="bi bi-geo-alt me-2 text-gray-300"></i> {{ job.location }}</p>
                  
                  <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div class="flex gap-2">
                       <a [routerLink]="['/jobs', job.id, 'kanban']" class="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Pipeline</a>
                    </div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modified: {{ job.updatedAt | date:'shortDate' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contacts Tab (Placeholder) -->
            <div *ngIf="activeTab === 'contacts'">
              <div class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <i class="bi bi-people text-4xl text-gray-300 mb-3 block"></i>
                <h4 class="text-lg font-bold text-gray-900">Contact Management</h4>
                <p class="text-gray-500 max-w-sm mx-auto mt-2">Manage key stakeholders and decision makers within {{ client.name }}.</p>
                <button class="mt-6 btn-secondary text-sm"><i class="bi bi-plus-lg me-2"></i> Add Contact</button>
              </div>
            </div>

            <!-- Activity Tab -->
            <div *ngIf="activeTab === 'notes'" class="h-[600px]">
              <app-activity-timeline relatedType="CLIENT" [relatedId]="clientId"></app-activity-timeline>
            </div>

            <!-- Team Tab -->
            <div *ngIf="activeTab === 'team'">
              <div class="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto border border-gray-100">
                 <h3 class="text-lg font-bold text-gray-900 mb-4">Access Control</h3>
                 <p class="text-sm text-gray-500 mb-6">The following team members have access to manage this client's details and associated jobs.</p>
                 
                 <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200" *ngIf="client.owner">
                       <div class="flex items-center gap-4">
                          <app-avatar [name]="client.owner.firstName + ' ' + client.owner.lastName" [size]="40"></app-avatar>
                          <div>
                             <p class="text-sm font-bold">{{ client.owner.firstName }} {{ client.owner.lastName }}</p>
                             <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Account Manager</span>
                          </div>
                       </div>
                    </div>
                    <div class="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                       <p class="text-gray-400 text-sm italic">Access is currently restricted to Account Managers and Admins.</p>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      <!-- Specialized Modals -->
      <div *ngIf="showEditModal" class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-content !max-w-2xl" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-6">Edit Client Organization</h2>
          <form (ngSubmit)="updateClient()" #editForm="ngForm">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group col-span-2">
                <label>Company Name *</label>
                <input type="text" [(ngModel)]="editClientForm.name" name="name" required class="form-input">
              </div>
              <div class="form-group">
                <label>Industry</label>
                <input type="text" [(ngModel)]="editClientForm.industry" name="industry" class="form-input">
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" [(ngModel)]="editClientForm.website" name="website" class="form-input" placeholder="https://example.com">
              </div>
              <div class="form-group col-span-2">
                <label>LinkedIn Profile URL</label>
                <input type="url" [(ngModel)]="editClientForm.linkedinUrl" name="linkedin" class="form-input">
              </div>
            </div>

            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-4">Primary Contact</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>Contact Person</label>
                <input type="text" [(ngModel)]="editClientForm.contactPerson" name="contactPerson" class="form-input">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="editClientForm.email" name="email" class="form-input">
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="editClientForm.phone" name="phone" class="form-input">
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="editClientForm.status" name="status" class="form-input">
                  <option value="PROSPECT">Prospect</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-4">Mailing Address</h3>
            <div class="grid grid-cols-2 gap-4">
               <div class="form-group col-span-2">
                  <label>Full Address</label>
                  <input type="text" [(ngModel)]="editClientForm.address" name="address" class="form-input">
               </div>
               <div class="form-group">
                  <label>City</label>
                  <app-location-input 
                    [(ngModel)]="editClientForm.city" 
                    name="city" 
                    placeholder="Enter city">
                  </app-location-input>
               </div>
               <div class="form-group">
                  <label>Country</label>
                  <input type="text" [(ngModel)]="editClientForm.country" name="country" class="form-input">
               </div>
            </div>

            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-4">Internal Assignment</h3>
            <div class="form-group">
              <label>Account Manager</label>
              <select [(ngModel)]="selectedOwnerId" name="owner" class="form-input">
                <option [ngValue]="null">Unassigned</option>
                <option *ngFor="let user of allUsers" [ngValue]="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.username }})</option>
              </select>
            </div>

            <div class="flex gap-3 mt-8">
              <button type="submit" [disabled]="!editForm.form.valid" class="btn-primary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Save Changes</button>
              <button type="button" (click)="closeEditModal()" class="btn-secondary flex-1 py-3 uppercase tracking-widest text-xs font-bold">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      
      <app-image-cropper *ngIf="showCropper" [imageChangedEvent]="imageChangedEvent" title="Update Client Logo" (cropped)="onImageCropped($event)" (cancel)="showCropper = false"></app-image-cropper>
      <app-tag-select-modal *ngIf="showTagModal && client" [selectedTags]="client.tags || []" (close)="showTagModal = false" (tagsChanged)="onTagsChanged($event)"></app-tag-select-modal>
      <div *ngIf="showAddJobModal" class="modal-overlay" (click)="showAddJobModal = false">
        <div class="modal-content !max-w-3xl !p-10 !rounded-[5px]" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h2 class="text-3xl font-black text-slate-900 tracking-tight">Create Job</h2>
              <p class="text-sm text-slate-500">Opening a new position for <span class="text-indigo-600 font-bold">{{ client.name }}</span></p>
            </div>
            <button (click)="showAddJobModal = false" class="text-slate-400 hover:text-slate-900 transition-colors text-2xl"><i class="bi bi-x-lg"></i></button>
          </div>

          <form (ngSubmit)="createJob()" #jobForm="ngForm">
            <div class="grid grid-cols-12 gap-5">
              <!-- Basic Info -->
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

              <!-- Skills & Tags -->
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
                  <option *ngFor="let user of allUsers" [value]="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.username }})</option>
                </select>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-1">Hold Ctrl/Cmd to select multiple members</p>
              </div>
            </div>

            <div class="flex gap-4 mt-10">
              <button type="submit" [disabled]="!jobForm.valid" class="btn-primary flex-1 py-4 uppercase tracking-widest text-[11px] font-black shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95">
                Launch Job Position
              </button>
              <button type="button" (click)="showAddJobModal = false" class="btn-secondary py-4 px-8 uppercase tracking-widest text-[11px] font-black">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .page-container { 
      padding: 0.5rem; 
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
      width: 100%;
      overflow-x: hidden;
      min-height: 100vh;
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
      text-transform: uppercase;
    }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.prospect { background: #fef3c7; color: #92400e; }
    .status-badge.inactive { background: #f3f4f6; color: #374151; }

    .info-item {
      position: relative;
    }
    .info-label {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.075em;
      margin-bottom: 0.25rem;
    }
    .info-value {
      font-size: 0.9375rem;
      color: #1e293b;
      font-weight: 600;
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
      z-index: 50;
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
      ring: 2px;
      ring-color: rgba(99, 102, 241, 0.2);
    }

    .job-card {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .job-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }

    .job-status {
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #6b7280;
      color: white;
    }
    .job-status.open { background: #10b981; }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary {
      background: white;
      color: var(--primary-color);
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
    }

    .stat-card {
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin-top: 0.5rem;
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
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  jobs: Job[] = [];
  loading = true;
  clientId!: number;
  activeTab: 'overview' | 'jobs' | 'contacts' | 'notes' | 'team' = 'overview';
  
  allUsers: User[] = [];
  selectedOwnerId: number | null = null;

  // Edit Modal
  showEditModal = false;
  editClientForm: Partial<Client> = {};
  showCropper = false;
  imageChangedEvent: any = '';

  // Tag Management
  showTagModal = false;

  // Add Job
  showAddJobModal = false;
  newJob: Partial<Job> = {
    status: 'OPEN'
  };
  templates: PipelineTemplate[] = [];
  selectedTemplateId: number | null = null;
  selectedRecruiterIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private jobService: JobService,
    private userService: UserService,
    private toastService: ToastService,
    private http: HttpClient,
    private pipelineTemplateService: PipelineTemplateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.clientId = +params['id'];
      this.loadClientDetails();
      this.loadClientJobs();
    });
    this.loadAllUsers();
    this.loadTemplates();
  }

  loadTemplates() {
    this.pipelineTemplateService.getAllTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  loadClientDetails() {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.editClientForm = { ...client };
        this.selectedOwnerId = client.owner?.id || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading = false;
      }
    });
  }

  loadClientJobs() {
    this.jobService.getJobsByClientId(this.clientId).subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
      }
    });
  }

  get openJobsCount(): number {
    return this.jobs.filter(j => j.status === 'OPEN').length;
  }

  get closedJobsCount(): number {
    return this.jobs.filter(j => j.status === 'CLOSED').length;
  }

  loadAllUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.allUsers = users;
    });
  }

  // Edit Logic
  openEditModal() {
      this.editClientForm = { ...this.client! };
      this.selectedOwnerId = this.client?.owner?.id || null;
      this.showEditModal = true;
  }

  closeEditModal() {
      this.showEditModal = false;
  }

  updateClient() {
      if (!this.client) return;
      
      const updatedClient = { ...this.editClientForm } as Client;
      
      if (this.selectedOwnerId) {
        updatedClient.owner = { id: this.selectedOwnerId } as any;
      } else {
        updatedClient.owner = null as any;
      }
      
      this.clientService.updateClient(this.client.id!, updatedClient).subscribe({
          next: (res) => {
              this.client = res;
              this.closeEditModal();
              this.toastService.show('Client updated successfully', 'success');
          },
          error: (err) => console.error('Failed to update client', err)
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
        const file = new File([blob], "logo.png", { type: "image/png" });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedType', 'CLIENT_LOGO');
        formData.append('relatedId', this.client!.id!.toString());

        this.http.post<any>('http://localhost:8080/api/attachments/upload', formData).subscribe(attachment => {
          const logoUrl = `http://localhost:8080/api/attachments/download/${attachment.id}`;
          this.client!.logoUrl = logoUrl;
          this.editClientForm.logoUrl = logoUrl; // Sync with edit form
          this.clientService.updateClient(this.client!.id!, this.client!).subscribe();
        });
      });
  }

  confirmDelete() {
      if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
          this.clientService.deleteClient(this.clientId).subscribe({
              next: () => {
                   this.toastService.show('Client deleted successfully', 'success');
                   this.router.navigate(['/clients']);
              },
              error: (err) => console.error('Failed to delete client', err)
          });
      }
  }

  onTagsChanged(tags: Tag[]) {
    if (!this.client) return;
    this.client.tags = tags;
    this.clientService.updateClient(this.clientId, this.client).subscribe();
  }

  removeTag(tag: Tag) {
    if (!this.client || !this.client.tags) return;
    this.client.tags = this.client.tags.filter(t => t.id !== tag.id);
    this.clientService.updateClient(this.clientId, this.client).subscribe();
  }

  updateField(fieldName: string, value: any) {
    if (!this.client) return;
    const updatedClient = { ...this.client, [fieldName]: value };
    
    // Optimistic update
    (this.client as any)[fieldName] = value;

    this.clientService.updateClient(this.clientId, updatedClient).subscribe({
      next: () => {
         this.toastService.show('Client updated', 'success');
      },
      error: (err) => {
         console.error('Update failed', err);
         this.toastService.show('Failed to update client', 'error');
         this.loadClientDetails(); // Revert on failure
      }
    });
  }

  createJob() {
    if (!this.client) return;

    const jobToCreate = {
      ...this.newJob,
      client: { id: this.client.id } as Client, // Minimal client object
      pipelineTemplateId: this.selectedTemplateId || undefined
    } as Job;

    this.jobService.createJob(jobToCreate).subscribe({
      next: (job) => {
        this.toastService.show('Job created successfully', 'success');
        
        // Assign recruiters if any selected
        if (this.selectedRecruiterIds.length > 0 && job.id) {
            this.jobService.assignRecruiters(job.id, this.selectedRecruiterIds).subscribe();
        }

        this.showAddJobModal = false;
        this.newJob = { 
          status: 'OPEN',
          headcount: 1,
          currency: 'USD'
        };
        this.selectedTemplateId = null;
        this.selectedRecruiterIds = [];
        this.loadClientJobs();
      },
      error: (err) => {
        console.error('Failed to create job', err);
        this.toastService.show('Failed to create job', 'error');
      }
    });
  }
}
