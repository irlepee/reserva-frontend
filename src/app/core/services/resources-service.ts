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
}
