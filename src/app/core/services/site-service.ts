import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  constructor(private http: HttpClient) { }

  api = API_CONFIG.apiUrl;
  
  getSites(): Promise<any[]> {
    return this.http
      .get<any[]>(`${this.api}/sites`)
      .toPromise()
      .then(r => r ?? []);
  }

  getAllSites(): Promise<any[]> {
    return this.getSites();
  }

  getSiteById(id: number): Promise<any> {
    return this.http
      .get<any>(`${this.api}/sites/${id}`)
      .toPromise()
      .then(r => r ?? {});
  }

  createSite(siteData: any): Promise<any> {
    return this.http
      .post<any>(`${this.api}/sites`, siteData)
      .toPromise();
  }

  updateSite(id: number, siteData: any): Promise<any> {
    return this.http
      .put<any>(`${this.api}/sites/${id}`, siteData)
      .toPromise();
  }

  deleteSite(id: number): Promise<any> {
    return this.http
      .delete<any>(`${this.api}/sites/${id}`)
      .toPromise();
  }

  getPublicSites() : Promise<any[]> {
    return this.http
      .get<any[]>(`${this.api}/reservas/sites`)
      .toPromise()
      .then(r => r ?? []);
  }

  getPublicResources(siteId: number): Promise<any[]> {
    return this.http
      .get<any[]>(`${this.api}/reservas/sites/${siteId}`)
      .toPromise()
      .then(r => r ?? []);
  }

  getSiteStats(siteId: number): Promise<any> {
    return this.http
      .get<any>(`${this.api}/sites/${siteId}/stats`)
      .toPromise()
      .then(r => r ?? {});
  }
}

