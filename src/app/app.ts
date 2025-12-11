import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotificationComponent } from './shared/components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('reserva-frontend');
}