import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Recommendation {
  resourceName: string;
  resourceType: string;
  site: string;
  suggestedHour: number;
  suggestedDuration: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  constructor(private http: HttpClient) {}

  getRecommendations(): Observable<{ recommendations: Recommendation[] }> {
    return this.http.get<{ recommendations: Recommendation[] }>(`${API_CONFIG.apiUrl}/reservas/recommend`);
  }
}
