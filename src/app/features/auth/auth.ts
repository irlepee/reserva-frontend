import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/authService';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer, Header, HttpClientModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  activeTab: 'login' | 'register' = 'login';

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  identifier = "";
  password = "";

  constructor(private authenticator: AuthService) {}

  async onLogin() {
  try {
    const result = await this.authenticator.login({
      identifier: this.identifier,
      password: this.password
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

}
