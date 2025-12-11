import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_CONFIG.apiUrl;

  userData: any = null;

  constructor(private http: HttpClient) { }

  login(data: { identifier: string; password: string }): Promise<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data).toPromise();
  }

  register(data: any): Promise<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data).toPromise();
  }

  verifyEmail(token: string): Promise<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-email`, { token }).toPromise();
  }

  fetchCurrentUser(): Promise<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/auth`, {
      headers: { Authorization: `Bearer ${token}` }
    }).toPromise();
  }
}