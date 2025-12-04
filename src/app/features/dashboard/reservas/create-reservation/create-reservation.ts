import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    private reservaService: ReservaService,
    private router: Router
  ) {}

  // PASO 1: Búsqueda y selección de sitio
  searchTerm: string = '';
  searchedSites: any[] = [];
  selectedSite: any = null;
  isSearching: boolean = false;

  // PASO 2: Selección de recurso
  siteResources: any[] = [];
  resourcesByCategory: Map<string, any[]> = new Map();
  resourceTypesMap: { [key: number]: string } = {};
  categories: string[] = [];
  selectedResource: any = null;

  // PASO 3: Calendario y horario
  selectedDate: string = '';
  startTime: string = '09:00';
  endTime: string = '10:00';
  currentCalendarDate: Date = new Date();

  // Estados de paso
  step: 'search' | 'resources' | 'datetime' | 'summary' = 'search';

  // URL de la API para imágenes
  apiUrl = 'http://localhost:3000';

  ngOnInit() {
    this.loadCategories();
  }

  // Cargar categorías desde el backend
  loadCategories() {
    this.resourcesService.getCategories()
      .then((categories: any[]) => {
        // Crear mapeo de ID a nombre para referencia rápida
        categories.forEach((category: any) => {
          this.resourceTypesMap[category.id] = category.name;
        });
      })
      .catch(() => {
        this.resourceTypesMap = {};
      });
  }

  // Obtener nombre del tipo de recurso por ID
  getTypeName(resourceTypeId: number): string {
    return this.resourceTypesMap[resourceTypeId] || 'Sin categoría';
  }

  // Obtener URL de imagen del sitio
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

  // Obtener todas las URLs de imágenes del sitio
  getAllImageUrls(images: any): string[] {
    if (!images || images.length === 0) {
      return [];
    }
    
    return images.map((img: string) => {
      if (img.startsWith('http')) {
        return img;
      }
      return `${this.apiUrl}${img}`;
    });
  }

  // PASO 1: Búsqueda de sitios
  searchSites() {
    if (!this.searchTerm.trim()) {
      this.searchedSites = [];
      return;
    }

    this.isSearching = true;
    
    this.siteService.getPublicSites()
      .then((sites: any[]) => {
        const term = this.searchTerm.toLowerCase();
        this.searchedSites = sites.filter(site =>
          site.name.toLowerCase().includes(term)
        );
        this.isSearching = false;
      })
      .catch((error: any) => {
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
    
    this.siteService.getPublicResources(this.selectedSite.id)
      .then((resources: any[]) => {
        this.siteResources = resources;
        this.organizeResourcesByCategory(resources);
      })
      .catch((error: any) => {
        this.siteResources = [];
        this.resourcesByCategory = new Map();
        this.categories = [];
      });
  }

  // Organizar recursos por categoría
  organizeResourcesByCategory(resources: any[]) {
    this.resourcesByCategory = new Map();
    
    resources.forEach(resource => {
      const categoryName = this.getTypeName(resource.resource_type);
      
      if (!this.resourcesByCategory.has(categoryName)) {
        this.resourcesByCategory.set(categoryName, []);
      }
      this.resourcesByCategory.get(categoryName)?.push(resource);
    });
    
    this.categories = Array.from(this.resourcesByCategory.keys());
  }

  getResourcesByCategory(category: string): any[] {
    return this.resourcesByCategory.get(category) || [];
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
    const startHour = parseInt(this.startTime);
    now.setHours(startHour, 0, 0, 0);

    const selectedDateTime = new Date(this.selectedDate);
    selectedDateTime.setHours(startHour, 0, 0, 0);

    if (selectedDateTime <= new Date()) {
      alert('No puedes hacer una reserva en el pasado');
      return false;
    }

    // Validar duración mínima (al menos 1 hora)
    const startHourInt = parseInt(this.startTime);
    const endHourInt = parseInt(this.endTime);
    const duration = endHourInt - startHourInt;

    if (duration < 1) {
      alert('La reserva debe ser por lo menos 1 hora');
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

  // PASO 3: Calendario
  calculateDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    const startHour = parseInt(this.startTime);
    const endHour = parseInt(this.endTime);
    return endHour - startHour;
  }

  getAvailableHours(): string[] {
    const hours: string[] = [];
    const today = new Date();
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Si es hoy, empezar desde la hora actual
    const startHour = selectedDate.getTime() === today.getTime() ? new Date().getHours() : 0;

    for (let i = startHour; i < 24; i++) {
      hours.push(String(i).padStart(2, '0'));
    }

    return hours;
  }

  getEndHours(): string[] {
    if (!this.startTime) return [];

    const hours: string[] = [];
    const startHour = parseInt(this.startTime);

    // Las horas finales empiezan desde una hora después de la inicial
    for (let i = startHour + 1; i <= 24; i++) {
      hours.push(String(i).padStart(2, '0'));
    }

    return hours;
  }

  // PASO 4: Resumen y crear reserva
  createReservation() {
    const startDateTime = new Date(`${this.selectedDate}T${this.startTime}:00`);
    const endDateTime = new Date(`${this.selectedDate}T${this.endTime}:00`);

    const reservationData = {
      id_resource: this.selectedResource.id,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
    };

    console.log('Reserva a crear:', reservationData);

    this.reservaService.createReservation(reservationData)
      .then((response: any) => {
        console.log('Reserva creada exitosamente:', response);
        alert('¡Reserva creada exitosamente!');
        this.router.navigate(['/dashboard/reservas']);
      })
      .catch((error: any) => {
        console.error('Error al crear la reserva:', error);
        alert('Error al crear la reserva. Por favor intenta de nuevo.');
      });
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
      this.startTime = '';
      this.endTime = '';
      this.step = 'datetime';
    }
  }

  getMonthYear() {
    return this.currentCalendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
