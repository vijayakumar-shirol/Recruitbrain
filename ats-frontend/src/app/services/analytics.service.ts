import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsResponse {
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  candidatesBySource: { [key: string]: any };
  pipelineConversion: StageConversion[];
  recruiterPerformance: RecruiterPerformance[];
  hiringTrend: HiringTrend;
}

export interface StageConversion {
  stageName: string;
  candidateCount: number;
  conversionRate: number;
}

export interface RecruiterPerformance {
  recruiterName: string;
  candidatesAdded: number;
  interviewsConducted: number;
  placements: number;
}

export interface HiringTrend {
  labels: string[];
  hires: number[];
  applications: number[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) { }

  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(this.apiUrl);
  }
}
