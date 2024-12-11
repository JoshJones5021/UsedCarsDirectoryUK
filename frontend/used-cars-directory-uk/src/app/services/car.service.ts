import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:5000/api/cars';

  constructor(private http: HttpClient) {}

  getCars(params: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getCar(carId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${carId}`);
  }

  addCar(carData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    return this.http.post<any>(this.apiUrl, carData, { headers });
  }

  updateCar(carId: string, carData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    return this.http.put<any>(`${this.apiUrl}/${carId}`, carData, { headers });
  }

  deleteCar(carId: string): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${carId}`, { headers });
  }

  searchCars(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  getMyCars(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/me`, { headers, params });
  }
}