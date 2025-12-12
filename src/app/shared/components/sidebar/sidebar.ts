import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';
import { NotificationsComponent } from '../notifications/notifications.component';
import { initializeSocket } from '../../../core/services/socketService';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule, NotificationsComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  user: any = null;
  showUserMenu = false;

  ngOnInit() {
    this.authService.fetchCurrentUser()
      .then(user => {
        this.user = user;
        
        // Inicializar Socket.IO con el token
        const token = localStorage.getItem('token');
        if (token) {
          initializeSocket(token);
          console.log('✅ Socket.IO inicializado para notificaciones');
        }
      })
      .catch(err => {
        this.user = null;
      });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
