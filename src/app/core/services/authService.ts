import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  userData: any = null;

  constructor(private http: HttpClient) { }

  login(data: { identifier: string; password: string }): Promise<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).toPromise();
  }

  register(data: any): Promise<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data).toPromise();
  }

  fetchCurrentUser(): Promise<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/auth`, {
      headers: { Authorization: `Bearer ${token}` }
    }).toPromise();
  }
}