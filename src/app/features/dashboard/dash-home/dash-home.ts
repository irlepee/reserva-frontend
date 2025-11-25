import { Component } from '@angular/core';
import { DashhomeDataService } from '../../../core/services/dashhome-data-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash-home',
  imports: [CommonModule],
  templateUrl: './dash-home.html',
  styleUrl: './dash-home.css',
})
export class DashHome {
  constructor(private dashDataService: DashhomeDataService) { }

  topSites: any = null;
  myReservas: any = null;

  ngOnInit() {
    this.dashDataService.getTopSites()
      .then(data => {
        this.topSites = data;
        console.log(data);
      })
      .catch(err => {
        console.log(err);
        this.topSites = null;
      });

    this.dashDataService.getMyReservas()
      .then(data => {
        this.myReservas = data;
        console.log(data);
      })
      .catch(err => {
        this.myReservas = null;
        console.log(err);
      });
  }
}