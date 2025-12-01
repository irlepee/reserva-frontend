import { Component } from '@angular/core';
import { SiteService } from '../../../../core/services/site-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash-sites',
  imports: [CommonModule],
  templateUrl: './dash-sites.html',
  styleUrl: './dash-sites.css',
})
export class DashSites {
  constructor(private siteService: SiteService) { }

  sites: any[] = [];

  ngOnInit() {
    this.siteService.getSites()
      .then((data) => {
        console.log(data);
        this.sites = data;
      })
      .catch((error) => {
        this.sites = [];
        console.error('Error fetching sites:', error);
      });
  }
}
