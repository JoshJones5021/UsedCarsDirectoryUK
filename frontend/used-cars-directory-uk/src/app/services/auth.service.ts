import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? !this.isTokenExpired(token) : false;
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return null;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  private getTokenExpirationDate(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  private isTokenExpired(token: string): boolean {
    const expirationDate = this.getTokenExpirationDate(token);
    return expirationDate ? expirationDate < new Date() : true;
  }
}