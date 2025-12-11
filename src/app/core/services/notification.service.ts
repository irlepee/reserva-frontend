import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationIdCounter = 0;

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(message: string, duration = 4000): void {
    this.addNotification(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.addNotification(message, 'error', duration);
  }

  warning(message: string, duration = 4000): void {
    this.addNotification(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.addNotification(message, 'info', duration);
  }

  private addNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    const id = `notification-${this.notificationIdCounter++}`;
    const notification: Notification = { id, message, type, duration };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }
  }

  private removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  removeById(id: string): void {
    this.removeNotification(id);
  }
}
