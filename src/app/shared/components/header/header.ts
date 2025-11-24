import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../features/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule, Auth, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  showLogin = false;

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }
}