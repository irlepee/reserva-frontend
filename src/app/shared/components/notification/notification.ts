import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {
  notifications$!: Observable<any[]>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notifications$ = this.notificationService.getNotifications();
  }

  closeNotification(id: string): void {
    this.notificationService.removeById(id);
  }
}
