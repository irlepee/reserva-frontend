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

  // TODO: Implementar en el backend
  // Debe devolver los detalles completos del grupo (nombre, descripción, color, etc.)
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

  // TODO: Implementar en el backend
  // Debe actualizar el grupo con los nuevos datos
  updateGroup(groupId: string, groupName: string, groupDescription: string, groupColor: number): Promise<any> {
    return this.http.put<any>(`${this.api}/groups/${groupId}`, { 
      name: groupName, 
      description: groupDescription, 
      color: groupColor 
    }).toPromise().then(r => r ?? {});
  }

  checkIfuserExists(identifier: string): Promise<boolean> {
    return this.http.post<boolean>(`${this.api}/groups/exists`, { identifier })
      .toPromise()
      .then(r => r ?? false);
  }

  // TODO: Implementar en el backend
  // Debe devolver los miembros del grupo
  getGroupMembers(groupId: string): Promise<any[]> {
    return this.http.get<any[]>(`${this.api}/groups/${groupId}/members`).toPromise().then(r => r ?? []);
  }
}

