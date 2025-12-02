import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../../shared/interfaces/group';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private api = 'http://localhost:3000';
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

  // TODO: Implementar en el backend
  // Debe devolver los miembros del grupo
  getGroupMembers(groupId: string): Promise<any[]> {
    return this.http.get<any[]>(`${this.api}/groups/${groupId}/members`).toPromise().then(r => r ?? []);
  }
  
  getInvitations(): Promise<any[]> {
    return this.http.get<any[]>(`${this.api}/groups/invitations`).toPromise().then(r => r ?? []);
  }
}

