import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailTemplate } from '../models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private apiUrl = 'http://localhost:8080/api/email-templates';

  constructor(private http: HttpClient) { }

  getAllTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl);
  }

  getActiveTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(`${this.apiUrl}/active`);
  }

  getTemplatesByCategory(category: string): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(`${this.apiUrl}/category/${category}`);
  }

  getTemplateById(id: number): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.apiUrl}/${id}`);
  }

  createTemplate(template: EmailTemplate): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.apiUrl, template);
  }

  updateTemplate(id: number, template: EmailTemplate): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${this.apiUrl}/${id}`, template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  previewTemplate(subject: string, body: string, variables: { [key: string]: string }): Observable<{ subject: string, body: string }> {
    return this.http.post<{ subject: string, body: string }>(`${this.apiUrl}/preview`, {
      subject,
      body,
      variables
    });
  }
}
