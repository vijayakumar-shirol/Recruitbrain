import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService, AnalyticsResponse } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container bg-gray-50/50 min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Advanced Analytics</h1>
        <p class="text-gray-500 mt-2 text-lg">Deep insights into your recruitment performance and pipeline physics.</p>
      </div>

      <div *ngIf="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div *ngIf="!loading && data" class="space-y-8 animate-in fade-in duration-700">
        <!-- Metric Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
                <i class="bi bi-clock-history text-2xl"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Time to Hire</h3>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-gray-900">{{ data.averageTimeToHire | number:'1.1-1' }}</span>
              <span class="text-gray-500 font-medium">days</span>
            </div>
            <div class="mt-4 flex items-center text-sm text-blue-600 font-medium">
              <i class="bi bi-info-circle me-1"></i>
              <span>Live tracking enabled</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-green-50 rounded-xl text-green-600">
                <i class="bi bi-check2-circle text-2xl"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Offer Acceptance</h3>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-gray-900">{{ data.offerAcceptanceRate | number:'1.1-1' }}%</span>
            </div>
            <div class="mt-4 flex items-center text-sm text-green-600 font-medium">
              <i class="bi bi-info-circle me-1"></i>
              <span>Live tracking enabled</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-purple-50 rounded-xl text-purple-600">
                <i class="bi bi-people text-2xl"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Sourced</h3>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-gray-900">{{ totalCandidates }}</span>
            </div>
            <div class="mt-4 flex items-center text-sm text-purple-600 font-medium">
              <i class="bi bi-graph-up me-1"></i>
              <span>Across all sources</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-orange-50 rounded-xl text-orange-600">
                <i class="bi bi-trophy text-2xl"></i>
              </div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Hires</h3>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-gray-900">{{ data.hiringTrend.hires[5] }}</span>
            </div>
            <div class="mt-4 flex items-center text-sm text-orange-600 font-medium">
              <i class="bi bi-calendar-check me-1"></i>
              <span>Current month</span>
            </div>
          </div>
        </div>

        <!-- Main Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Hiring Trend -->
          <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xl font-bold text-gray-800">Hiring & Application Trends</h3>
              <div class="flex gap-2">
                <span class="flex items-center text-xs font-medium text-gray-500">
                  <span class="w-3 h-3 bg-primary-500 rounded-full me-2"></span> Hires
                </span>
                <span class="flex items-center text-xs font-medium text-gray-500">
                  <span class="w-3 h-3 bg-primary-200 rounded-full me-2"></span> Applications
                </span>
              </div>
            </div>
            <div class="relative h-72">
               <svg class="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                 <line x1="0" y1="0" x2="800" y2="0" stroke="#f3f4f6" stroke-width="1" />
                 <line x1="0" y1="75" x2="800" y2="75" stroke="#f3f4f6" stroke-width="1" />
                 <line x1="0" y1="150" x2="800" y2="150" stroke="#f3f4f6" stroke-width="1" />
                 <line x1="0" y1="225" x2="800" y2="225" stroke="#f3f4f6" stroke-width="1" />
                 
                 <g *ngFor="let month of data.hiringTrend.labels; let i = index">
                   <!-- Max scale for apps is 50 for now, hires 10 -->
                   <rect [attr.x]="100 * i + 35" [attr.y]="300 - (Math.min(data.hiringTrend.applications[i], 50) / 55 * 300)" 
                         width="30" [attr.height]="Math.min(data.hiringTrend.applications[i], 50) / 55 * 300" 
                         fill="#e0e7ff" rx="4" />
                   <rect [attr.x]="100 * i + 35" [attr.y]="300 - (Math.min(data.hiringTrend.hires[i], 10) / 11 * 300)" 
                         width="30" [attr.height]="Math.min(data.hiringTrend.hires[i], 10) / 11 * 300" 
                         [style.fill]="'var(--primary-color)'" rx="4" />
                 </g>
               </svg>
               <div class="flex justify-between mt-4 px-8">
                 <span *ngFor="let label of data.hiringTrend.labels" class="text-xs font-bold text-gray-400 uppercase tracking-tighter">{{ label }}</span>
               </div>
            </div>
          </div>

          <!-- Source Distribution -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-8">Candidate Sources</h3>
            <div class="space-y-6">
              <div *ngFor="let source of sourceEntries" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="font-semibold text-gray-700">{{ source.key }}</span>
                  <span class="text-gray-500">{{ source.value }} ({{ (totalCandidates > 0 ? source.value / totalCandidates * 100 : 0) | number:'1.0-0' }}%)</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div class="bg-primary-600 h-full transition-all duration-1000 ease-out" 
                       [style.width.%]="totalCandidates > 0 ? source.value / totalCandidates * 100 : 0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recruiter Performance & Pipeline -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Recruiter Performance -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-8">Recruiter Performance</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
                    <th class="pb-4">Recruiter</th>
                    <th class="pb-4 text-center">Sourced</th>
                    <th class="pb-4 text-center">Hires</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr *ngFor="let rec of data.recruiterPerformance" class="group hover:bg-gray-50 transition-colors">
                    <td class="py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {{ rec.recruiterName.substring(0, 2).toUpperCase() }}
                        </div>
                        <span class="font-semibold text-gray-700">{{ rec.recruiterName }}</span>
                      </div>
                    </td>
                    <td class="py-4 text-center font-medium text-gray-600">{{ rec.candidatesAdded }}</td>
                    <td class="py-4 text-center">
                      <span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">{{ rec.placements }}</span>
                    </td>
                  </tr>
                  <tr *ngIf="data.recruiterPerformance.length === 0">
                    <td colspan="3" class="py-8 text-center text-gray-400 italic">No activity recorded yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pipeline Funnel -->
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-bold text-gray-800 mb-10 text-center">Conversion Funnel</h3>
            <div class="space-y-4">
              <div *ngFor="let step of data.pipelineConversion; let i = index" class="relative">
                <div class="flex items-center gap-4">
                  <div class="w-20 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ step.stageName }}</div>
                  <div class="flex-1">
                    <div class="bg-primary-600 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                         [style.width.%]="100 - (i * 12)"
                         [style.opacity]="1 - (i * 0.1)"
                         [style.margin-left.%]="i * 6"
                         class="h-10">
                      {{ step.candidateCount }}
                    </div>
                  </div>
                  <div class="w-16">
                    <span *ngIf="i > 0" class="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                      {{ step.conversionRate | number:'1.0-0' }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0.5rem;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  data?: AnalyticsResponse;
  loading = true;
  sourceEntries: { key: string, value: number }[] = [];
  totalCandidates = 0;
  protected readonly Math = Math;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getAnalytics().subscribe(data => {
      this.data = data;
      this.loading = false;
      this.sourceEntries = Object.entries(data.candidatesBySource)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => b.value - a.value);
      this.totalCandidates = this.sourceEntries.reduce((acc, curr) => acc + curr.value, 0);
    });
  }
}
