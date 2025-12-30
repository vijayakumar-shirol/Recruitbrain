import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipelineTemplateService } from '../../services/pipeline-template.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AvatarComponent } from '../../../app/components/shared/avatar/avatar.component';
import { ImageCropperComponent } from '../../../app/components/shared/image-cropper/image-cropper.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent, ImageCropperComponent],
  template: `
    <div class="p-2 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
          <p class="text-gray-500 mt-1">Manage your account, pipeline templates, and system preferences.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Tabs -->
        <div class="lg:col-span-1">
          <nav class="space-y-2">
            <button (click)="activeTab = 'profile'" 
              [class.bg-white]="activeTab === 'profile'"
              [class.shadow-sm]="activeTab === 'profile'"
              [class.text-primary-600]="activeTab === 'profile'"
              [class.ring-1]="activeTab === 'profile'"
              [class.ring-gray-200]="activeTab === 'profile'"
              class="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group">
              <i class="bi bi-person-circle mr-3 text-lg transition-colors" [class.text-primary-600]="activeTab === 'profile'" [class.text-gray-400]="activeTab !== 'profile'"></i>
              Profile
            </button>
            <button (click)="activeTab = 'pipelines'" 
              [class.bg-white]="activeTab === 'pipelines'"
              [class.shadow-sm]="activeTab === 'pipelines'"
              [class.text-primary-600]="activeTab === 'pipelines'"
              [class.ring-1]="activeTab === 'pipelines'"
              [class.ring-gray-200]="activeTab === 'pipelines'"
              class="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group">
              <i class="bi bi-layers mr-3 text-lg transition-colors" [class.text-primary-600]="activeTab === 'pipelines'" [class.text-gray-400]="activeTab !== 'pipelines'"></i>
              Pipeline Templates
            </button>
            <button (click)="activeTab = 'general'" 
              [class.bg-white]="activeTab === 'general'"
              [class.shadow-sm]="activeTab === 'general'"
              [class.text-primary-600]="activeTab === 'general'"
              [class.ring-1]="activeTab === 'general'"
              [class.ring-gray-200]="activeTab === 'general'"
              class="w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group">
              <i class="bi bi-sliders mr-3 text-lg transition-colors" [class.text-primary-600]="activeTab === 'general'" [class.text-gray-400]="activeTab !== 'general'"></i>
              General Settings
            </button>
          </nav>
        </div>

        <!-- Main Content Area -->
        <div class="lg:col-span-3">
          <!-- Profile Tab -->
          <div *ngIf="activeTab === 'profile'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Personal Profile</h2>
                  <p class="text-sm text-gray-500">View and edit your personal profile settings.</p>
                </div>
                <button (click)="updateProfile()" class="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
                   Save Changes
                </button>
              </div>
              <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                   <div>
                     <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                     <div class="relative">
                        <i class="bi bi-person absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" [(ngModel)]="myProfile.username" disabled class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm font-medium">
                     </div>
                     <p class="mt-2 text-[10px] text-gray-400 flex items-center"><i class="bi bi-info-circle me-1"></i> Username cannot be changed for security reasons.</p>
                   </div>
                   <div>
                     <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                     <div class="relative">
                        <i class="bi bi-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="email" [(ngModel)]="myProfile.email" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium">
                     </div>
                   </div>
                </div>
                
                <div class="bg-primary-50 px-6 py-6 rounded-2xl border border-primary-100 h-fit">
                   <div class="flex items-center gap-4 mb-4">
                      <div class="relative group cursor-pointer" (click)="profileInput.click()">
                         <app-avatar 
                           [name]="myProfile.username" 
                           [imageUrl]="myProfile.profilePictureUrl" 
                           [size]="64" 
                           type="candidate">
                         </app-avatar>
                         <div class="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span class="text-white text-[10px] font-bold">CHANGE</span>
                         </div>
                         <input type="file" #profileInput (change)="onProfileFileSelected($event)" class="hidden" accept="image/*">
                      </div>
                      <div>
                         <div class="font-bold text-gray-900">{{ myProfile.username }}</div>
                         <div class="text-sm text-primary-600 font-medium">Public Profile</div>
                      </div>
                   </div>
                   <p class="text-sm text-primary-800 leading-relaxed mb-4">You are currently logged in as a <strong>Recruiter</strong>. Your email is visible to candidates when you initiate contact.</p>
                   <div class="flex gap-2">
                      <span class="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-primary-600 uppercase border border-primary-100">Official</span>
                      <span class="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-primary-600 uppercase border border-primary-100">Verified</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- Password Section -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
               <div class="px-6 py-6 border-b border-gray-100">
                  <h2 class="text-xl font-bold text-gray-900">Security & Password</h2>
                  <p class="text-sm text-gray-500">Manage your password and account security.</p>
               </div>
               <div class="p-8">
                  <div class="max-w-md space-y-6">
                     <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                        <div class="relative">
                           <i class="bi bi-shield-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                           <input type="password" [(ngModel)]="passwordForm.newPassword" placeholder="Minimum 6 characters" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium">
                        </div>
                     </div>
                     <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                        <div class="relative">
                           <i class="bi bi-shield-check absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                           <input type="password" [(ngModel)]="passwordForm.confirmPassword" placeholder="Repeat new password" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium">
                        </div>
                     </div>
                     <button (click)="changePassword()" class="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">
                        Update Password
                     </button>
                  </div>
               </div>
            </div>
          </div>

          <!-- Pipelines Tab -->
          <div *ngIf="activeTab === 'pipelines'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div class="flex justify-between items-center mb-8">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Customized Pipelines</h2>
                  <p class="text-sm text-gray-500">Define the stages for your hiring process.</p>
                </div>
                <button (click)="openCreateModal()" class="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
                  <i class="bi bi-plus-lg"></i> New Template
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let template of templates" class="group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/20 transition-all duration-300">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-primary-50 flex items-center justify-center text-primary-600 transition-colors">
                       <i class="bi bi-diagram-3 text-xl"></i>
                    </div>
                    <div class="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="openEditModal(template)" class="p-2 text-gray-400 hover:text-primary-600">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button (click)="confirmDelete(template)" class="p-2 text-gray-400 hover:text-red-500">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <h3 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{{ template.name }}</h3>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ template.stages?.length || 0 }} Stages</span>
                    <div class="flex -space-x-1">
                       <div *ngFor="let stage of template.stages?.slice(0,3)" class="w-2 h-2 rounded-full border border-white" [style.backgroundColor]="stage.color"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- General Tab -->
          <div *ngIf="activeTab === 'general'" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 class="text-xl font-bold text-gray-900 mb-2">General Configuration</h2>
              <p class="text-gray-500 italic">Global system preferences will be available in the next update.</p>
              <div class="mt-8 p-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center">
                 <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-primary-400 text-3xl mb-4">
                    <i class="bi bi-gear-wide-connected"></i>
                 </div>
                 <h4 class="text-gray-900 font-bold">Coming Soon</h4>
                 <p class="text-sm text-gray-400 max-w-xs">We are building a more powerful way to customize your workspace.</p>
              </div>
          </div>
        </div>
      </div>

      <!-- Image Cropper Modal -->
      <app-image-cropper
        *ngIf="showCropper"
        [imageChangedEvent]="imageChangedEvent"
        title="Update Profile Picture"
        (cropped)="onImageCropped($event)"
        (cancel)="showCropper = false"
      ></app-image-cropper>

      <!-- Template Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
          <h2 class="text-xl font-bold mb-4">{{ editingTemplate ? 'Edit Template' : 'Create Template' }}</h2>
          <form (ngSubmit)="saveTemplate()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Template Name</label>
              <input type="text" [(ngModel)]="templateForm.name" name="name" required placeholder="e.g. Engineering, Sales..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
            </div>

            <div class="mt-6">
              <div class="flex justify-between items-center mb-2">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <i class="bi bi-list-task"></i> Pipeline Stages
                </label>
                <button type="button" (click)="addStage()" class="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  <i class="bi bi-plus-circle"></i> Add Stage
                </button>
              </div>
              <div class="space-y-2 max-h-60 overflow-y-auto p-1">
                <div *ngFor="let stage of templateForm.stages; let i = index" class="flex items-center space-x-2">
                  <span class="text-gray-400 text-xs w-4">{{ i + 1 }}</span>
                  <input type="text" [(ngModel)]="stage.name" name="stageName{{i}}" required placeholder="Stage name"
                    class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <input type="color" [(ngModel)]="stage.color" name="stageColor{{i}}"
                    class="h-9 w-12 rounded border border-gray-300 p-1">
                  <button type="button" (click)="removeStage(i)" class="text-red-400 hover:text-red-600 p-2 transition-colors">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p *ngIf="templateForm.stages.length === 0" class="text-center py-4 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                No stages added. Every pipeline needs at least one stage.
              </p>
            </div>

            <div class="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
              <button type="button" (click)="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" [disabled]="templateForm.stages.length === 0" 
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                {{ editingTemplate ? 'Update Template' : 'Create Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {
  activeTab: 'profile' | 'pipelines' | 'general' = 'profile';
  templates: any[] = [];
  showModal = false;
  editingTemplate: any = null;

  myProfile: any = {};
  passwordForm = {
    newPassword: '',
    confirmPassword: ''
  };

  templateForm: any = {
    name: '',
    stages: []
  };

  showCropper = false;
  imageChangedEvent: any = '';

  constructor(
    private templateService: PipelineTemplateService,
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.userService.getCurrentUser().subscribe((user: any) => this.myProfile = user);
  }

  updateProfile(): void {
    this.userService.updateMyProfile(this.myProfile).subscribe({
      next: (updatedUser: any) => {
        // Update local auth user to reflect changes (like profile pic) in header
        const currentUser = this.authService.getUser();
        this.authService.saveUser({ ...currentUser, ...updatedUser });
        alert('Profile updated successfully!');
      },
      error: (err: any) => console.error('Failed to update profile', err)
    });
  }

  onProfileFileSelected(event: any) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  onImageCropped(base64: string) {
    this.showCropper = false;
    this.uploadAvatar(base64);
  }

  uploadAvatar(base64: string) {
    fetch(base64)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "avatar.png", { type: "image/png" });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('relatedType', 'USER_AVATAR');
        formData.append('relatedId', this.myProfile.id.toString());

        this.http.post<any>('http://localhost:8080/api/attachments/upload', formData).subscribe(attachment => {
          const avatarUrl = `http://localhost:8080/api/attachments/download/${attachment.id}`;
          this.myProfile.profilePictureUrl = avatarUrl;
          this.updateProfile();
        });
      });
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }

    this.userService.changeMyPassword({ newPassword: this.passwordForm.newPassword }).subscribe({
      next: () => {
        alert('Password updated successfully!');
        this.passwordForm = { newPassword: '', confirmPassword: '' };
      },
      error: (err: any) => alert('Failed to update password')
    });
  }

  loadTemplates(): void {
    this.templateService.getAllTemplates().subscribe(data => this.templates = data);
  }

  openCreateModal(): void {
    this.editingTemplate = null;
    this.templateForm = {
      name: '',
      stages: [
        { name: 'Sourcing', position: 0, color: '#94a3b8' },
        { name: 'Screening', position: 1, color: '#60a5fa' },
        { name: 'Interview', position: 2, color: '#818cf8' },
        { name: 'Offer', position: 3, color: '#34d399' },
        { name: 'Hired', position: 4, color: '#10b981' }
      ]
    };
    this.showModal = true;
  }

  openEditModal(template: any): void {
    this.editingTemplate = template;
    this.templateForm = {
      name: template.name,
      stages: template.stages.map((s: any) => ({ ...s }))
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addStage(): void {
    this.templateForm.stages.push({
      name: '',
      position: this.templateForm.stages.length,
      color: '#64748b'
    });
  }

  removeStage(index: number): void {
    this.templateForm.stages.splice(index, 1);
    // Update positions
    this.templateForm.stages.forEach((s: any, i: number) => s.position = i);
  }

  saveTemplate(): void {
    if (this.editingTemplate) {
      this.templateService.updateTemplate(this.editingTemplate.id, this.templateForm).subscribe(() => {
        this.loadTemplates();
        this.closeModal();
      });
    } else {
      this.templateService.createTemplate(this.templateForm).subscribe(() => {
        this.loadTemplates();
        this.closeModal();
      });
    }
  }

  confirmDelete(template: any): void {
    if (confirm(`Are you sure you want to delete the "${template.name}" template? This won't affect existing jobs.`)) {
      this.templateService.deleteTemplate(template.id).subscribe(() => this.loadTemplates());
    }
  }
}
