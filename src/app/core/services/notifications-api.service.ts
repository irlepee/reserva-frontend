import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class NotificationsApiService {
  private apiUrl = `${API_CONFIG.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener notificaciones paginadas
   */
  getNotifications(offset: number = 0, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  /**
   * Obtener notificaciones no leídas
   */
  getUnreadNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/list`);
  }

  /**
   * Contar notificaciones no leídas
   */
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/count`);
  }

  /**
   * Marcar notificaciones como leídas
   */
  markAsRead(notificationIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read`, { notificationIds });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }
}
