import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:8080/api/candidates';

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  createCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.apiUrl, candidate);
  }

  updateCandidate(id: number, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidate);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  parseResume(file: File): Observable<Candidate> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Candidate>(`${this.apiUrl}/parse-resume`, formData);
  }

  getRecommendations(candidateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${candidateId}/recommendations`);
  }

  sendEmail(candidateId: number, templateId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${candidateId}/send-email`, { templateId });
  }
}
