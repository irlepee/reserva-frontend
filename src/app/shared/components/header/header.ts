import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../features/auth/auth';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';

@Component({
  selector: 'app-header',
  imports: [RouterModule, Auth, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(private authService: AuthService) { }

  showLogin = false;

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }

  user: any = null;

  ngOnInit() {
    this.authService.fetchCurrentUser()
      .then(user => {
        this.user = user;
      })
      .catch(err => {
        this.user = null;
      });
  }
}