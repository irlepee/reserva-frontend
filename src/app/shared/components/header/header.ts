import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../../features/auth/auth';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';

@Component({
  selector: 'app-header',
  imports: [RouterModule, Auth, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  showLogin = false;
  isLoggedIn = false;
  user: any = null;
  showUserDropdown = false;

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.authService.fetchCurrentUser()
      .then(user => {
        this.user = user;
      })
      .catch(err => {
        this.user = null;
      });
  }

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard/home']);
    this.showUserDropdown = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }
}