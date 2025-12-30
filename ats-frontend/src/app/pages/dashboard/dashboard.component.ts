import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { AvatarComponent } from '../../components/shared/avatar/avatar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AvatarComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-gray-900">Good morning, {{ currentUser?.firstName || 'Admin' }}! 👋</h1>
          <p class="text-gray-500 font-medium mt-1">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/candidates" class="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <i class="bi bi-people mr-2"></i> Candidates
          </a>
          <a routerLink="/jobs" class="flex items-center px-4 py-2 bg-primary-600 rounded-xl text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md shadow-primary-200">
            <i class="bi bi-plus-lg mr-2"></i> Create Job
          </a>
        </div>
      </div>

      <!-- Summary Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" *ngIf="stats">
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="bi bi-briefcase"></i>
            </div>
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">ACTIVE</span>
          </div>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Open Jobs</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h2 class="text-4xl font-black text-gray-900">{{ stats.summary.openJobs }}</h2>
            <span class="text-xs font-bold text-gray-500">out of {{ stats.summary.totalJobs }} total</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="bi bi-people"></i>
            </div>
            <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">POOL</span>
          </div>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Candidates</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h2 class="text-4xl font-black text-gray-900">{{ stats.summary.totalCandidates }}</h2>
            <span class="text-xs font-bold text-green-500">↑ Healthy</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="bi bi-stars"></i>
            </div>
            <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">NEW</span>
          </div>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">New last 7 days</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h2 class="text-4xl font-black text-gray-900">{{ stats.summary.newCandidatesLast7Days }}</h2>
            <span class="text-xs font-bold text-amber-500">+{{ ((stats.summary.newCandidatesLast7Days / (stats.summary.totalCandidates || 1)) * 100).toFixed(0) }}% growth</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="bi bi-bullseye"></i>
            </div>
            <span class="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">HIRED</span>
          </div>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Placements</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h2 class="text-4xl font-black text-gray-900">12</h2>
            <span class="text-xs font-bold text-gray-500">This Month</span>
          </div>
        </div>
      </div>

      <!-- Main Visualizations Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8" *ngIf="stats">
        
        <!-- Pipeline Funnel Representation -->
        <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-black text-gray-900">Pipeline Funnel</h3>
            <span class="text-xs font-bold text-primary-600 cursor-pointer hover:underline">VIEW ALL STAGES</span>
          </div>
          
          <div class="space-y-5">
            <div *ngFor="let stage of stats.pipelineDistribution; let i = index" class="relative">
              <div class="flex justify-between items-center mb-1.5 px-1">
                <span class="text-sm font-bold text-gray-700 uppercase tracking-tight">{{ stage.stageName }}</span>
                <span class="text-sm font-black text-gray-900">{{ stage.count }}</span>
              </div>
              <div class="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                     [style.width.%]="(stage.count / (maxPipelineCount || 1)) * 100"
                     [style.background-color]="stage.color || 'var(--primary-color)'">
                </div>
              </div>
            </div>
            
            <div *ngIf="stats.pipelineDistribution.length === 0" class="py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No candidates currently in the pipeline.
            </div>
          </div>
        </div>

        <!-- hiring Trend / Performance Line Repr (Using simple bars for clean look) -->
        <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-black text-gray-900">Application Trends</h3>
            <div class="flex gap-1">
                <div class="w-2 h-2 rounded-full bg-primary-600"></div>
                <div class="w-2 h-2 rounded-full bg-purple-200"></div>
            </div>
          </div>
          
          <div class="h-64 flex items-end justify-between gap-4 px-2">
            <div *ngFor="let trend of stats.hiringTrend" class="flex-1 flex flex-col items-center group">
              <div class="w-full bg-primary-50 rounded-t-xl relative group-hover:bg-primary-100 transition-colors"
                   [style.height.%]="(trend.count / (maxTrendCount || 1)) * 90 + 10">
                <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {{ trend.count }} Candidates
                </div>
              </div>
              <p class="text-[9px] font-black text-gray-400 mt-3 rotate-45 md:rotate-0 origin-center text-center leading-none">{{ trend.date }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recruiter Performance Table -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" *ngIf="stats">
        <div class="p-8 border-b border-gray-50 flex justify-between items-center">
            <div>
                <h3 class="text-xl font-black text-gray-900">Recruiter Performance</h3>
                <p class="text-xs font-medium text-gray-500 mt-1">Top performers ranked by candidate throughput.</p>
            </div>
            <button class="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">EXPORT LIST</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recruiter</th>
                <th class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Jobs</th>
                <th class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidates</th>
                <th class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Throughput</th>
                <th class="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let recruiter of stats.recruiterPerformance" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-5">
                  <div class="flex items-center">
                    <app-avatar [name]="recruiter.name" [imageUrl]="recruiter.profilePictureUrl" [size]="40" type="user"></app-avatar>
                    <div class="ml-4">
                      <p class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ recruiter.name }}</p>
                      <p class="text-[10px] font-bold text-gray-400 uppercase">Senior Recruiter</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <span class="text-sm font-black text-gray-900">{{ recruiter.activeJobs }}</span>
                </td>
                <td class="px-8 py-5">
                  <span class="text-sm font-black text-gray-900">{{ recruiter.candidatesInPipeline }}</span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-black text-gray-900">{{ recruiter.conversionRate.toFixed(1) }}</span>
                    <span class="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">HIGH</span>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 rounded-full" 
                         [style.width.%]="(recruiter.candidatesInPipeline / (maxRecruiterCandidates || 1)) * 100"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="stats.recruiterPerformance.length === 0" class="py-12 text-center text-gray-400 text-sm italic">
            No recruiter performance data available.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  maxPipelineCount = 1;
  maxTrendCount = 1;
  maxRecruiterCandidates = 1;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(stats => {
      this.stats = stats;
      
      // Calculate max values for scaling representations
      if (stats.pipelineDistribution.length > 0) {
        this.maxPipelineCount = Math.max(...stats.pipelineDistribution.map(s => s.count));
      }
      
      if (stats.hiringTrend.length > 0) {
        this.maxTrendCount = Math.max(...stats.hiringTrend.map(s => s.count));
      }
      
      if (stats.recruiterPerformance.length > 0) {
        this.maxRecruiterCandidates = Math.max(...stats.recruiterPerformance.map(r => r.candidatesInPipeline));
      }
    });
  }

  get currentUser(): any {
    return this.authService.getUser();
  }
}
