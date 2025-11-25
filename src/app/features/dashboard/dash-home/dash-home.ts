import { Component } from '@angular/core';
import { DashhomeDataService } from '../../../core/services/dashhome-data-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';

@Component({
  selector: 'app-dash-home',
  imports: [CommonModule],
  templateUrl: './dash-home.html',
  styleUrl: './dash-home.css',
})
export class DashHome {
  constructor(private dashDataService: DashhomeDataService, private authService: AuthService) { }

  topSites: any = null;
  reservas: any = null;
  user: any = null;

  ngOnInit() {
    this.dashDataService.getTopSites()
      .then(data => {
        this.topSites = data;
      })
      .catch(err => {
        this.topSites = null;
      });

    this.dashDataService.getMyReservas()
      .then(data => {
        this.reservas = data;
      })
      .catch(err => {
        this.reservas = null;
      });

    this.authService.fetchCurrentUser()
      .then(data => {
        this.user = data;
      })
      .catch(err => {
        this.user = null;
      });
  }
}