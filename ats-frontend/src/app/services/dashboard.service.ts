import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  summary: {
    totalJobs: number;
    openJobs: number;
    totalCandidates: number;
    newCandidatesLast7Days: number;
  };
  pipelineDistribution: Array<{
    stageName: string;
    count: number;
    color: string;
  }>;
  recruiterPerformance: Array<{
    name: string;
    profilePictureUrl?: string;
    activeJobs: number;
    candidatesInPipeline: number;
    conversionRate: number;
  }>;
  hiringTrend: Array<{
    date: string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
