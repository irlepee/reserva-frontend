import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ResourcesService {
    constructor(private http: HttpClient) { }

    api = 'http://localhost:3000';

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
}
