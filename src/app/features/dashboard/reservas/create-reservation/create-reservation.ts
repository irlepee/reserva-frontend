import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../../../core/services/site-service';
import { ResourcesService } from '../../../../core/services/resources-service';
import { ReservaService } from '../../../../core/services/reserva-service';

@Component({
  selector: 'app-create-reservation',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-reservation.html',
  styleUrl: './create-reservation.css',
})
export class CreateReservationComponent implements OnInit {
  constructor(
    private siteService: SiteService,
    private resourcesService: ResourcesService,
    private reservaService: ReservaService
  ) {}

  // PASO 1: Búsqueda y selección de sitio
  searchTerm: string = '';
  searchedSites: any[] = [];
  selectedSite: any = null;
  isSearching: boolean = false;

  // PASO 2: Selección de recurso
  siteResources: any[] = [];
  selectedResource: any = null;

  // PASO 3: Calendario y horario
  selectedDate: string = '';
  startTime: string = '09:00';
  endTime: string = '10:00';

  // Estados de paso
  step: 'search' | 'resources' | 'datetime' | 'summary' = 'search';

  ngOnInit() {}

  // PASO 1: Búsqueda de sitios
  searchSites() {
    if (!this.searchTerm.trim()) {
      this.searchedSites = [];
      return;
    }

    this.isSearching = true;
    this.siteService.getAllSites()
      .then((sites: any[]) => {
        const term = this.searchTerm.toLowerCase();
        this.searchedSites = sites.filter(site =>
          site.name.toLowerCase().includes(term)
        );
        this.isSearching = false;
      })
      .catch((error: any) => {
        console.error('Error searching sites:', error);
        this.searchedSites = [];
        this.isSearching = false;
      });
  }

  selectSite(site: any) {
    this.selectedSite = site;
    this.step = 'resources';
    this.loadSiteResources();
  }

  loadSiteResources() {
    if (!this.selectedSite) return;

    this.resourcesService.getResources(this.selectedSite.id)
      .then((resources: any[]) => {
        this.siteResources = resources;
      })
      .catch((error: any) => {
        console.error('Error loading resources:', error);
        this.siteResources = [];
      });
  }

  // PASO 2: Selección de recurso
  selectResource(resource: any) {
    this.selectedResource = resource;
    this.step = 'datetime';
  }

  // PASO 3: Calendario
  getCalendarDays() {
    const date = this.selectedDate ? new Date(this.selectedDate) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }

  selectDate(day: number | null) {
    if (!day) return;
    const date = this.selectedDate ? new Date(this.selectedDate) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    this.selectedDate = new Date(year, month, day).toISOString().split('T')[0];
  }

  goToSummary() {
    if (this.selectedDate && this.startTime && this.endTime) {
      this.step = 'summary';
    } else {
      alert('Por favor selecciona fecha y horario');
    }
  }

  // PASO 4: Resumen y crear reserva
  createReservation() {
    // Por ahora solo mostramos el resumen sin funcionalidad
    const startDateTime = new Date(`${this.selectedDate}T${this.startTime}`);
    const endDateTime = new Date(`${this.selectedDate}T${this.endTime}`);

    const reservationData = {
      id_resource: this.selectedResource.id,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
    };

    console.log('Reserva a crear:', reservationData);
    alert('¡Reserva creada exitosamente! (Simulado)');
    // this.reservaService.createReservation(reservationData)...
  }

  // Navegación
  goBack() {
    if (this.step === 'resources') {
      this.selectedSite = null;
      this.selectedResource = null;
      this.step = 'search';
      this.searchTerm = '';
      this.searchedSites = [];
    } else if (this.step === 'datetime') {
      this.selectedResource = null;
      this.step = 'resources';
    } else if (this.step === 'summary') {
      this.selectedDate = '';
      this.startTime = '09:00';
      this.endTime = '10:00';
      this.step = 'datetime';
    }
  }

  getMonthYear() {
    const date = this.selectedDate ? new Date(this.selectedDate) : new Date();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
