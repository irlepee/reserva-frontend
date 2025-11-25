import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { DashhomeDataService } from '../../../core/services/dashhome-data-service';

@Component({
  selector: 'app-home',
  imports: [Sidebar, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
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
