import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/shared/footer/footer';
import { Header } from '../../components/shared/header/header';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, Footer, Header],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})

export class Auth {
  activeTab: 'login' | 'register' = 'login';

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }
}
