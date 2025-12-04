import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { Auth } from '../auth/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, CommonModule, Auth],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(private router: Router) {}

  isLoggedIn: boolean = false;
  showLogin: boolean = false;

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }

  navigateTo(route: string) {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }
    
    switch(route) {
      case 'sites':
        this.router.navigate(['/dashboard/sites']);
        break;
      case 'groups':
        this.router.navigate(['/dashboard/groups']);
        break;
      case 'reservas':
        this.router.navigate(['/dashboard/reservas']);
        break;
      default:
        break;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard/home']);
  }

  searchOrLogin() {
    if (!this.isLoggedIn) {
      this.openLogin();
    } else {
      this.router.navigate(['/dashboard/reservas']);
    }
  }
}