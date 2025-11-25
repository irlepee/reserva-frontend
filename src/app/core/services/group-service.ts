import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../../shared/interfaces/group';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private api = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getGroups(): Promise<Group[]> {
    return this.http.get<any[]>(`${this.api}/groups`).toPromise().then(r => r ?? []);
  }
}
