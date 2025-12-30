import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GlobalSearchResult {
  id: number;
  type: 'CANDIDATE' | 'JOB' | 'CLIENT';
  title: string;
  subtitle: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<GlobalSearchResult[]> {
    return this.http.get<GlobalSearchResult[]>(`${this.apiUrl}?query=${query}`);
  }
}
