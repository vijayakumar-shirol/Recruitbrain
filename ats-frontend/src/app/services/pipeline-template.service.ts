import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PipelineTemplate } from '../models/pipeline-template.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PipelineTemplateService {
  private apiUrl = `${environment.apiUrl}/pipeline-templates`;

  constructor(private http: HttpClient) {}

  getAllTemplates(): Observable<PipelineTemplate[]> {
    return this.http.get<PipelineTemplate[]>(this.apiUrl);
  }

  getTemplateById(id: number): Observable<PipelineTemplate> {
    return this.http.get<PipelineTemplate>(`${this.apiUrl}/${id}`);
  }

  createTemplate(template: PipelineTemplate): Observable<PipelineTemplate> {
    return this.http.post<PipelineTemplate>(this.apiUrl, template);
  }

  updateTemplate(id: number, template: PipelineTemplate): Observable<PipelineTemplate> {
    return this.http.put<PipelineTemplate>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
