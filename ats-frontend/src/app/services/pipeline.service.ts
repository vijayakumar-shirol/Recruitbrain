import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PipelineStage, CandidatePipeline } from '../models/pipeline.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PipelineService {
  private apiUrl = `${environment.apiUrl}/pipeline`;

  constructor(private http: HttpClient) {}

  getJobPipeline(jobId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/job/${jobId}`);
  }

  getStagesByJobId(jobId: number): Observable<PipelineStage[]> {
    return this.http.get<PipelineStage[]>(`${this.apiUrl}/job/${jobId}/stages`);
  }

  createStage(jobId: number, stage: PipelineStage): Observable<PipelineStage> {
    return this.http.post<PipelineStage>(`${this.apiUrl}/job/${jobId}/stages`, stage);
  }

  addCandidateToJob(jobId: number, candidateId: number, stageId: number): Observable<CandidatePipeline> {
    return this.http.post<CandidatePipeline>(
      `${this.apiUrl}/job/${jobId}/candidate/${candidateId}/stage/${stageId}`,
      null
    );
  }

  assignCandidateToJob(jobId: number, candidateId: number): Observable<CandidatePipeline> {
    return this.http.post<CandidatePipeline>(
      `${this.apiUrl}/job/${jobId}/candidate/${candidateId}`,
      null
    );
  }

  moveCandidateToStage(candidateId: number, jobId: number, stageId: number): Observable<CandidatePipeline> {
    return this.http.put<CandidatePipeline>(
      `${this.apiUrl}/candidate/${candidateId}/job/${jobId}/move/${stageId}`,
      null
    );
  }

  getCandidatePipelines(candidateId: number): Observable<CandidatePipeline[]> {
    return this.http.get<CandidatePipeline[]>(`${this.apiUrl}/candidate/${candidateId}`);
  }

  removeCandidateFromJob(jobId: number, candidateId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/job/${jobId}/candidate/${candidateId}`);
  }
}
