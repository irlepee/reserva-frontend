import { Component } from '@angular/core';
import { SiteService } from '../../../../core/services/site-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dash-sites',
  imports: [CommonModule, RouterLink],
  templateUrl: './dash-sites.html',
  styleUrl: './dash-sites.css',
})
export class DashSites {
  constructor(private siteService: SiteService) { }

  sites: any[] = [];
  apiUrl = 'http://localhost:3000';

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

  getImageUrl(images: any): string {
    if (!images || images.length === 0) {
      return '/images/placeholder-site.jpg';
    }
    
    const firstImage = images[0];
    
    // Si ya es una URL completa
    if (firstImage.startsWith('http')) {
      return firstImage;
    }
    
    // Si es un nombre de archivo, construir la URL
    return `${this.apiUrl}${firstImage}`;
  }
}
