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
  sidebarOpen = true; // Por defecto abierto en desktop, cerrado en móvil

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

    // Detectar si es mobile y cerrar sidebar por defecto
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
