import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../../../core/services/site-service';
import { ResourcesService } from '../../../../core/services/resources-service';
import { ReservaService } from '../../../../core/services/reserva-service';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
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
  currentCalendarDate: Date = new Date();

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
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

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

  previousMonth() {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() - 1
    );
  }

  nextMonth() {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() + 1
    );
  }

  selectDate(day: number | null) {
    if (!day) return;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    this.selectedDate = new Date(year, month, day).toISOString().split('T')[0];
  }

  isDateSelected(day: number | null): boolean {
    if (!day || !this.selectedDate) return false;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return dateStr === this.selectedDate;
  }

  isDateDisabled(day: number | null): boolean {
    if (!day) return true;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  }

  goToSummary() {
    if (!this.selectedDate) {
      alert('Por favor selecciona una fecha');
      return;
    }

    if (!this.validateTimes()) {
      return;
    }

    this.step = 'summary';
  }

  validateTimes(): boolean {
    // Validar que la hora de inicio sea antes que la de fin
    if (this.startTime >= this.endTime) {
      alert('La hora de inicio debe ser anterior a la hora de fin');
      return false;
    }

    // Validar que no sea una reserva en el pasado
    const now = new Date();
    const selectedDateTime = new Date(`${this.selectedDate}T${this.startTime}`);

    if (selectedDateTime <= now) {
      alert('No puedes hacer una reserva en el pasado');
      return false;
    }

    // Validar duración mínima (al menos 30 minutos)
    const startMinutes = parseInt(this.startTime.split(':')[0]) * 60 + parseInt(this.startTime.split(':')[1]);
    const endMinutes = parseInt(this.endTime.split(':')[0]) * 60 + parseInt(this.endTime.split(':')[1]);
    const duration = endMinutes - startMinutes;

    if (duration < 30) {
      alert('La reserva debe ser por lo menos 30 minutos');
      return false;
    }

    return true;
  }

  getMinStartTime(): string {
    if (!this.selectedDate) return '00:00';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Si es hoy, la hora mínima es la actual
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return '00:00';
  }

  calculateDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    const startMinutes = parseInt(this.startTime.split(':')[0]) * 60 + parseInt(this.startTime.split(':')[1]);
    const endMinutes = parseInt(this.endTime.split(':')[0]) * 60 + parseInt(this.endTime.split(':')[1]);
    return (endMinutes - startMinutes) / 60;
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
    return this.currentCalendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
