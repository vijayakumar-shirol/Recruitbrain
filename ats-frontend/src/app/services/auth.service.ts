import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth-token';
  private userKey = 'auth-user';

  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.userSubject.next(response);
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    window.localStorage.clear();
    window.location.reload();
  }

  saveToken(token: string): void {
    window.localStorage.removeItem(this.tokenKey);
    window.localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return window.localStorage.getItem(this.tokenKey);
  }

  saveUser(user: any): void {
    window.localStorage.removeItem(this.userKey);
    window.localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUserFromStorage(): any {
    const user = window.localStorage.getItem(this.userKey);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  getUser(): any {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
