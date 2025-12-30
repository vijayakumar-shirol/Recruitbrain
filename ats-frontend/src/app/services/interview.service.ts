import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:8080/api/interviews';

  constructor(private http: HttpClient) { }

  getAllInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.apiUrl);
  }

  getInterviewById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.apiUrl}/${id}`);
  }

  getInterviewsByJob(jobId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/job/${jobId}`);
  }

  getInterviewsByCandidate(candidateId: number): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/candidate/${candidateId}`);
  }

  getUpcomingInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/upcoming`);
  }

  scheduleInterview(request: {
    candidatePipelineId: number;
    scheduledAt: string;
    durationMinutes?: number;
    interviewType: string;
    location?: string;
    notes?: string;
    interviewerIds?: number[];
  }): Observable<Interview> {
    return this.http.post<Interview>(this.apiUrl, request);
  }

  updateInterview(id: number, interview: Partial<Interview>): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}`, interview);
  }

  addFeedback(id: number, feedback: string, rating?: number): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/${id}/feedback`, { feedback, rating });
  }

  cancelInterview(id: number): Observable<Interview> {
    return this.http.post<Interview>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
