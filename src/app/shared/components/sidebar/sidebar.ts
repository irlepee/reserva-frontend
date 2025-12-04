import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
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
