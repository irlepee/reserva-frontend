import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
    providedIn: 'root',
})
export class ResourcesService {
    constructor(private http: HttpClient) { }

    api = API_CONFIG.apiUrl;

    getCategories(): Promise<any[]> {
        return this.http
            .get<any[]>(`${this.api}/sites/categories`)
            .toPromise()
            .then(r => r ?? []);
    }

    getResources(siteId: number): Promise<any[]> {
        return this.http
            .get<any[]>(`${this.api}/sites/${siteId}/resources`)
            .toPromise()
            .then(r => r ?? []);
    }

    createResource(siteId: number, resourceData: any): Promise<any> {
        return this.http
            .post<any>(`${this.api}/sites/${siteId}/resources`, resourceData)
            .toPromise()
            .then(r => r ?? {});
    }

    editResource(siteId: number, resourceId: number, resourceData: any): Promise<any> {
        return this.http
            .put<any>(`${this.api}/sites/${siteId}/resources/${resourceId}`, resourceData)
            .toPromise()
            .then(r => r ?? {});
    }

    deleteResource(siteId: number, resourceId: number): Promise<any> {
        return this.http
            .delete<any>(`${this.api}/sites/${siteId}/resources/${resourceId}`)
            .toPromise()
            .then(r => r ?? {});
    }
}
