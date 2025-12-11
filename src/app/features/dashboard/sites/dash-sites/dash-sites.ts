import { Component, OnInit } from '@angular/core';
import { SiteService } from '../../../../core/services/site-service';
import { ResourcesService } from '../../../../core/services/resources-service';
import { API_CONFIG } from '../../../../core/config/api.config';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dash-sites',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dash-sites.html',
  styleUrl: './dash-sites.css',
})
export class DashSites implements OnInit {
  constructor(
    private siteService: SiteService,
    private router: Router,
    private resourcesService: ResourcesService
  ) { }

  sites: any[] = [];
  sitesFiltered: any[] = [];
  search: string = '';
  apiUrl = API_CONFIG.apiUrl;
  resourcesCount: Map<number, number> = new Map();

  ngOnInit() {
    this.loadSites();
  }

  loadSites() {
    this.siteService.getSites()
      .then((data) => {
        this.sites = data;
        this.sitesFiltered = data;
        this.loadResourcesCounts();
      })
      .catch((error) => {
        this.sites = [];
        this.sitesFiltered = [];
        console.error('Error fetching sites:', error);
      });
  }

  loadResourcesCounts() {
    this.sites.forEach(site => {
      this.resourcesService.getResources(site.id)
        .then((resources: any[]) => {
          this.resourcesCount.set(site.id, resources.length);
        })
        .catch((error) => {
          this.resourcesCount.set(site.id, 0);
          console.error(`Error fetching resources for site ${site.id}:`, error);
        });
    });
  }

  getResourcesCount(siteId: number): number {
    return this.resourcesCount.get(siteId) || 0;
  }

  filtrarPorNombre(): void {
    const term = this.search.toLowerCase();
    this.sitesFiltered = term
      ? this.sites.filter((site: any) => site.name.toLowerCase().includes(term))
      : this.sites;
  }

  getImageUrl(images: any): string {
    if (!images || images.length === 0) {
      return '';
    }
    
    const firstImage = images[0];
    
    // Si ya es una URL completa
    if (firstImage.startsWith('http')) {
      return firstImage;
    }
    
    // Si es un nombre de archivo, construir la URL
    return `${this.apiUrl}${firstImage}`;
  }

  goToEditSite(siteId: number): void {
    this.router.navigate(['/dashboard/sites/edit', siteId]);
  }

  goToManageResources(siteId: number): void {
    this.router.navigate(['/dashboard/sites/manage-resources', siteId]);
  }

  goToStats(siteId: number): void {
    this.router.navigate(['/dashboard/sites/stats', siteId]);
  }

  goToManageSite(siteId: number): void {
    this.router.navigate(['/dashboard/sites/manage', siteId]);
  }
}
