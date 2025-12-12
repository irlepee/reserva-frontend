import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationsApiService } from '../../../core/services/notifications-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { onNotificationReceived } from '../../../core/services/socketService';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadCount: number = 0;
  isLoading: boolean = false;
  isOpen: boolean = false;
  selectedNotifications: Set<string> = new Set();
  
  private offset: number = 0;
  private limit: number = 50;

  constructor(
    private notificationsApiService: NotificationsApiService,
    private toastService: NotificationService
  ) {
    // Escuchar notificaciones en tiempo real
    onNotificationReceived((notification: any) => {
      this.handleNewNotification(notification);
    });
  }

  ngOnInit() {
    this.loadNotifications();
    this.updateUnreadCount();
  }

  /**
   * Cargar notificaciones desde la API
   */
  loadNotifications() {
    this.isLoading = true;
    this.notificationsApiService.getNotifications(this.offset, this.limit).subscribe({
      next: (response: any) => {
        this.notifications = response.notifications || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Actualizar el contador de no leídas
   */
  updateUnreadCount() {
    this.notificationsApiService.getUnreadCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.unreadCount || 0;
      },
      error: (err) => {
        console.error('Error obteniendo contador:', err);
      }
    });
  }

  /**
   * Abrir/cerrar modal
   */
  toggleModal() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadNotifications();
      this.updateUnreadCount();
    }
  }

  /**
   * Cerrar modal
   */
  closeModal() {
    this.isOpen = false;
  }

  /**
   * Seleccionar/deseleccionar notificación
   */
  toggleNotificationSelection(notificationId: string) {
    if (this.selectedNotifications.has(notificationId)) {
      this.selectedNotifications.delete(notificationId);
    } else {
      this.selectedNotifications.add(notificationId);
    }
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(notificationIds: string[]) {
    if (!notificationIds || notificationIds.length === 0) return;
    
    this.notificationsApiService.markAsRead(notificationIds).subscribe({
      next: () => {
        this.loadNotifications();
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Error marcando como leída:', err);
        this.toastService.error('Error al marcar como leída');
      }
    });
  }

  /**
   * Marcar notificaciones seleccionadas como leídas
   */
  markSelectedAsRead() {
    if (this.selectedNotifications.size === 0) return;

    const ids = Array.from(this.selectedNotifications);
    this.notificationsApiService.markAsRead(ids).subscribe({
      next: () => {
        this.toastService.success('Notificaciones marcadas como leídas');
        this.selectedNotifications.clear();
        this.loadNotifications();
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Error marcando como leídas:', err);
        this.toastService.error('Error al marcar como leídas');
      }
    });
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead() {
    this.notificationsApiService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('Todas las notificaciones marcadas como leídas');
        this.selectedNotifications.clear();
        this.loadNotifications();
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Error marcando todas como leídas:', err);
        this.toastService.error('Error al marcar como leídas');
      }
    });
  }

  /**
   * Eliminar notificación
   */
  deleteNotification(notificationId: string) {
    this.notificationsApiService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.toastService.success('Notificación eliminada');
        this.selectedNotifications.delete(notificationId);
        this.loadNotifications();
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('Error eliminando notificación:', err);
        this.toastService.error('Error al eliminar notificación');
      }
    });
  }

  /**
   * Eliminar notificaciones seleccionadas
   */
  deleteSelected() {
    if (this.selectedNotifications.size === 0) return;

    this.selectedNotifications.forEach(id => {
      this.deleteNotification(id);
    });
  }

  /**
   * Manejar nuevas notificaciones en tiempo real
   */
  private handleNewNotification(notification: any) {
    // Agregar a la lista
    this.notifications.unshift(notification);
    
    // Actualizar contador
    this.updateUnreadCount();
    
    // Mostrar toast informativo (opcional)
    this.toastService.info(`${notification.title}: ${notification.body}`, 3000);
  }

  /**
   * Obtener icono según tipo de notificación
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'reserva_created':
        return 'bi-calendar-plus';
      case 'reserva_cancelled_admin':
        return 'bi-calendar-x';
      case 'reserva_reminder_15min':
      case 'reserva_ending_15min':
        return 'bi-clock-history';
      case 'reserva_ended':
        return 'bi-check-circle';
      case 'invitation_received':
        return 'bi-person-plus';
      case 'invitation_accepted':
      case 'invitation_rejected':
        return 'bi-chat-dots';
      case 'group_member_removed':
        return 'bi-person-dash';
      default:
        return 'bi-bell';
    }
  }

  /**
   * Obtener color según tipo de notificación
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'reserva_created':
        return '#00cc66';
      case 'reserva_cancelled_admin':
        return '#ff6b6b';
      case 'reserva_reminder_15min':
      case 'reserva_ending_15min':
        return '#ffa500';
      case 'invitation_received':
        return '#667eea';
      default:
        return '#0066cc';
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }
}
