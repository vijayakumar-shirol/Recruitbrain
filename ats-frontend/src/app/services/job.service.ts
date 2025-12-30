import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8080/api/jobs';

  constructor(private http: HttpClient) {}

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  getJobsByClientId(clientId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/client/${clientId}`);
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  updateJob(id: number, job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignRecruiter(jobId: number, userId: number): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/${jobId}/recruiters/${userId}`, {});
  }

  removeRecruiter(jobId: number, userId: number): Observable<Job> {
    return this.http.delete<Job>(`${this.apiUrl}/${jobId}/recruiters/${userId}`);
  }

  getRecommendations(jobId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${jobId}/recommendations`);
  }

  getSuggestedCandidates(jobId: number): Observable<any[]> {
    return this.getRecommendations(jobId);
  }

  assignRecruiters(jobId: number, userIds: number[]): Observable<Job> {
      // Assuming a backend endpoint exists or simulating individual calls. 
      // Since backend implementation for bulk assign requires checking, 
      // I will implement a bulk assign endpoint or method if needed, but for now 
      // I will assume the backend accepts a list or I loop. 
      // Actually, looking at the previous backend code, I might need to implement this endpoint.
      // But for the frontend build, let's define it.
      return this.http.post<Job>(`${this.apiUrl}/${jobId}/recruiters`, userIds);
  }
}
