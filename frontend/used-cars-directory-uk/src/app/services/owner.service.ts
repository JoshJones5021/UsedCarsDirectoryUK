import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private apiUrl = 'http://localhost:5000/api/cars';

  constructor(private http: HttpClient) {}

  addOwner(carId: string, owner: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    owner.purchase_date = this.formatDate(owner.purchase_date);
    owner.sold_date = owner.sold_date ? this.formatDate(owner.sold_date) : null;
    return this.http.post<any>(`${this.apiUrl}/${carId}/owners`, owner, { headers });
  }

  updateOwner(carId: string, ownerId: string, owner: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    owner.purchase_date = this.formatDate(owner.purchase_date);
    owner.sold_date = owner.sold_date ? this.formatDate(owner.sold_date) : null;
    return this.http.put<any>(`${this.apiUrl}/${carId}/owners/${ownerId}`, owner, { headers });
  }

  deleteOwner(carId: string, ownerId: string): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${carId}/owners/${ownerId}`, { headers });
  }

  private formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}