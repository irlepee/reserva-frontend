import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  constructor(private http: HttpClient) { }

  api = 'http://localhost:3000';
  
  getSites(): Promise<any[]> {
    return this.http
      .get<any[]>(`${this.api}/sites`)
      .toPromise()
      .then(r => r ?? []);
  }

  createSite(siteData: any): Promise<any> {
    return this.http
      .post<any>(`${this.api}/sites`, siteData)
      .toPromise();
  }
}
