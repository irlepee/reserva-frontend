import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../../shared/interfaces/group';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private api = API_CONFIG.apiUrl;
  constructor(private http: HttpClient) { }

  getGroups(): Promise<Group[]> {
    return this.http.get<any[]>(`${this.api}/groups`).toPromise().then(r => r ?? []);
  }

  getGroupById(groupId: string): Promise<any> {
    return this.http.get<any>(`${this.api}/groups/${groupId}`).toPromise().then(r => r ?? {});
  }

  createGroup(groupName: string, groupDescription: string, groupColor: number): Promise<any> {
    return this.http.post<any>(`${this.api}/groups`, {
      name: groupName,
      description: groupDescription,
      color: groupColor
    }).toPromise().then(r => r ?? {});
  }

  updateGroup(groupId: string, groupName: string, groupDescription: string, groupColor: number): Promise<any> {
    return this.http.put<any>(`${this.api}/groups/${groupId}`, {
      name: groupName,
      description: groupDescription,
      color: groupColor
    }).toPromise().then(r => r ?? {});
  }

  checkIfuserExists(identifier: string): Promise<string> {
    return this.http.post<any>(`${this.api}/groups/exists`, { identifier })
      .toPromise()
      .then(response => {
        // Si devuelve directamente un número (el ID)
        if (typeof response === 'number') {
          return response.toString();
        }
        // Si devuelve un string (el ID)
        if (typeof response === 'string') {
          return response;
        }
        // Si el backend devuelve un objeto con el ID
        if (response && response.id) {
          return response.id.toString();
        }
        throw new Error('Usuario no encontrado');
      })
      .catch(() => {
        throw new Error('Usuario no encontrado');
      });
  }

  getGroupMembers(groupId: string): Promise<any[]> {
    return this.http.get<any[]>(`${this.api}/groups/${groupId}/members`).toPromise().then(r => r ?? []);
  }

  getInvitations(): Promise<any[]> {
    return this.http.get<any[]>(`${this.api}/groups/invitations`).toPromise().then(r => r ?? []);
  }

  inviteUser(groupId: string, users: number[]): Promise<any> {
    return this.http.post<any>(`${this.api}/groups/${groupId}/invite`, { users })
      .toPromise()
      .then(r => r ?? {});
  }

  acceptInvitation(groupId: string): Promise<any> {
    return this.http.post<any>(`${this.api}/groups/accept`, { groupId })
      .toPromise()
      .then(r => r ?? {});
  }

  rejectInvitation(groupId: string): Promise<any> {
    return this.http.post<any>(`${this.api}/groups/reject`, { groupId })
      .toPromise()
      .then(r => r ?? {});
  }

  getGroupAdmin(groupId: string): Promise<any> {
    return this.http.get<any>(`${this.api}/groups/${groupId}/admin`)
      .toPromise()
      .then(r => r ?? {});
  }

  removeMember(groupId: string, userId: string): Promise<any> {
    return this.http.post<any>(`${this.api}/groups/${groupId}/remove`, { userId })
      .toPromise()
      .then(r => r ?? {});
  }

  deleteGroup(groupId: string): Promise<any> {
    return this.http.delete<any>(`${this.api}/groups/${groupId}`)
      .toPromise()
      .then(r => r ?? {});
  }
}

