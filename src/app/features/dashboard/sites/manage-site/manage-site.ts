import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../../../core/services/site-service';
import { ReservaService } from '../../../../core/services/reserva-service';
import { ResourcesService } from '../../../../core/services/resources-service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-manage-site',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-site.html',
  styleUrl: './manage-site.css'
})
export class ManageSite implements OnInit {
  siteId: number = 0;
  siteName: string = '';
  loading: boolean = true;
  loadingReservas: boolean = false;
  loadingCategories: boolean = false;

  // Datos de estadísticas
  stats = {
    // Resumen general
    totalReservas: 0,
    reservasUltimaSemana: 0,
    reservasUltimoMes: 0,
    tasaOcupacion: 0,
    
    // Reservas por día de la semana (últimas 4 semanas)
    reservasPorDia: [
      { dia: 'Lun', cantidad: 0 },
      { dia: 'Mar', cantidad: 0 },
      { dia: 'Mié', cantidad: 0 },
      { dia: 'Jue', cantidad: 0 },
      { dia: 'Vie', cantidad: 0 },
      { dia: 'Sáb', cantidad: 0 },
      { dia: 'Dom', cantidad: 0 }
    ],
    
    // Recursos más reservados
    topRecursos: [] as { nombre: string; reservas: number; porcentaje: number }[],
    
    // Horas más populares
    horasPopulares: [] as { hora: string; cantidad: number }[],
    
    // Tipos de reserva
    tiposReserva: {
      individuales: 0,
      grupales: 0
    }
  };

  // Reservas
  allReservas: any[] = [];
  resourcesByCategory: { [key: string]: any[] } = {};
  reservasByResource: { [key: number]: any[] } = {};
  resourceCategories: any[] = [];
  resourceCategoriesMap: { [key: number]: string } = {};
  selectedDate: string = this.getTodayDate();
  expandedCategories: { [key: string]: boolean } = {};
  expandedResources: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService,
    private reservaService: ReservaService,
    private resourcesService: ResourcesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = +params['id'];
      this.loadSiteInfo();
      this.loadStats();
      // Cargar recursos y reservas primero, categorías en background
      this.loadResourcesAndGroupByCat();
      this.loadReservas();
      // Cargar categorías sin bloquear
      this.loadCategoriesInBackground();
    });
  }

  loadSiteInfo() {
    this.siteService.getSiteById(this.siteId)
      .then(site => {
        this.siteName = site.name || 'Sitio';
      })
      .catch(() => {
        this.siteName = 'Sitio';
      });
  }

  loadStats() {
    this.loading = true;
    this.siteService.getSiteStats(this.siteId)
      .then(data => {
        // Mapear datos de la API
        this.stats.totalReservas = data.totalReservas || 0;
        this.stats.reservasUltimaSemana = data.reservasUltimaSemana || 0;
        this.stats.reservasUltimoMes = data.reservasUltimoMes || 0;
        this.stats.tasaOcupacion = data.tasaOcupacion || 0;
        
        if (data.reservasPorDia) {
          this.stats.reservasPorDia = data.reservasPorDia;
        }
        
        if (data.topRecursos) {
          this.stats.topRecursos = data.topRecursos;
        }
        
        if (data.horasPopulares) {
          this.stats.horasPopulares = data.horasPopulares;
        }
        
        if (data.tiposReserva) {
          this.stats.tiposReserva = data.tiposReserva;
        }
        
        this.loading = false;
      })
      .catch(err => {
        console.error('Error cargando estadísticas:', err);
        this.loading = false;
      });
  }

  loadCategoriesInBackground(): void {
    this.loadingCategories = true;
    this.resourcesService.getCategories()
      .then((categories: any[]) => {
        this.resourceCategories = categories;
        
        // Crear mapeo de ID a nombre
        categories.forEach((category: any) => {
          this.resourceCategoriesMap[category.id] = category.name;
          this.expandedCategories[category.name] = true;
        });
        
        this.loadingCategories = false;
        // Reagrupar recursos ahora que tenemos las categorías
        this.regroupResourcesByCategory();
      })
      .catch((error: any) => {
        console.error('Error cargando categorías:', error);
        this.loadingCategories = false;
      });
  }

  loadCategories(): Promise<void> {
    return this.resourcesService.getCategories()
      .then((categories: any[]) => {
        this.resourceCategories = categories;
        
        // Crear mapeo de ID a nombre
        categories.forEach((category: any) => {
          this.resourceCategoriesMap[category.id] = category.name;
          this.expandedCategories[category.name] = true;
        });
      })
      .catch((error: any) => {
        console.error('Error cargando categorías:', error);
      });
  }

  regroupResourcesByCategory() {
    // Reagrupar con las categorías que ya tenemos
    const tempResourcesByCategory: { [key: string]: any[] } = {};
    
    Object.keys(this.resourcesByCategory).forEach(key => {
      this.resourcesByCategory[key].forEach((resource: any) => {
        const categoryName = this.resourceCategoriesMap[resource.resource_type] || 'Sin categoría';
        
        if (!tempResourcesByCategory[categoryName]) {
          tempResourcesByCategory[categoryName] = [];
        }
        
        tempResourcesByCategory[categoryName].push(resource);
      });
    });
    
    // Reemplazar si hay cambios
    if (Object.keys(tempResourcesByCategory).length > 0) {
      this.resourcesByCategory = tempResourcesByCategory;
    }
  }

  loadResourcesAndGroupByCat() {
    if (!this.siteId) return;
    
    this.resourcesService.getResources(this.siteId)
      .then((resources: any[]) => {
        // Agrupar recursos por categoría (resource_type)
        this.resourcesByCategory = {};
        
        resources.forEach((resource: any) => {
          const categoryName = this.resourceCategoriesMap[resource.resource_type] || 'Sin categoría';
          
          if (!this.resourcesByCategory[categoryName]) {
            this.resourcesByCategory[categoryName] = [];
          }
          
          this.resourcesByCategory[categoryName].push(resource);
          this.expandedResources[resource.id] = true;
        });
      })
      .catch(err => {
        console.error('Error cargando recursos:', err);
        this.resourcesByCategory = {};
      });
  }

  loadReservas() {
    this.loadingReservas = true;
    this.reservaService.getReservasBySite(this.siteId)
      .then((data: any[]) => {
        this.allReservas = data;
        this.filterAndGroupByResource();
        this.loadingReservas = false;
      })
      .catch(err => {
        console.error('Error cargando reservas:', err);
        this.allReservas = [];
        this.reservasByResource = {};
        this.loadingReservas = false;
      });
  }

  filterAndGroupByResource() {
    // Limpiar agrupación anterior
    this.reservasByResource = {};

    // Agrupar por fecha
    const selectedDateObj = new Date(this.selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    // Inicializar todos los recursos con arrays vacíos
    Object.values(this.resourcesByCategory).forEach((resourcesInCat: any[]) => {
      resourcesInCat.forEach((resource: any) => {
        this.reservasByResource[resource.id] = [];
      });
    });

    // Agrupar reservas por recurso (solo las de la fecha seleccionada)
    this.allReservas.forEach(reserva => {
      const reservaDate = new Date(reserva.start_date);
      reservaDate.setHours(0, 0, 0, 0);

      if (reservaDate.getTime() === selectedDateObj.getTime()) {
        const resourceId = reserva.id_resource;
        if (!this.reservasByResource[resourceId]) {
          this.reservasByResource[resourceId] = [];
        }
        this.reservasByResource[resourceId].push(reserva);
      }
    });
  }

  onDateChange() {
    this.filterAndGroupByResource();
  }

  toggleCategory(categoryName: string) {
    this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
  }

  toggleResource(resourceId: number) {
    this.expandedResources[resourceId] = !this.expandedResources[resourceId];
  }

  cancelReserva(reservaId: number, resourceId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.cancelReservation(reservaId)
        .then(() => {
          // Eliminar de allReservas
          this.allReservas = this.allReservas.filter(r => r.id !== reservaId);
          // Regrupar
          this.filterAndGroupByResource();
          this.notificationService.success('Reserva cancelada exitosamente.');
        })
        .catch(err => {
          console.error('Error cancelando reserva:', err);
          this.notificationService.error('Error al cancelar la reserva.');
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMaxReservasDia(): number {
    return Math.max(...this.stats.reservasPorDia.map(d => d.cantidad), 1);
  }

  getMaxHorasPopulares(): number {
    return Math.max(...this.stats.horasPopulares.map(h => h.cantidad), 1);
  }

  getTotalTiposReserva(): number {
    return this.stats.tiposReserva.individuales + this.stats.tiposReserva.grupales || 1;
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getTotalReservasForDate(): number {
    return Object.values(this.reservasByResource).reduce((total, reservas: any[]) => total + reservas.length, 0);
  }

  getReservasForCategory(categoryName: string): number {
    let total = 0;
    const resources = this.resourcesByCategory[categoryName] || [];
    resources.forEach((resource: any) => {
      total += (this.reservasByResource[resource.id] || []).length;
    });
    return total;
  }

  hasCategoryReservas(categoryName: string): boolean {
    return this.getReservasForCategory(categoryName) > 0;
  }

  hasResourcesWithReservas(categoryName: string): boolean {
    const resources = this.resourcesByCategory[categoryName] || [];
    return resources.some((resource: any) => (this.reservasByResource[resource.id] || []).length > 0);
  }

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }
}
