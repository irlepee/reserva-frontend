import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../../../core/services/site-service';
import { ReservaService } from '../../../../core/services/reserva-service';

@Component({
  selector: 'app-manage-site',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-site.html',
  styleUrl: './manage-site.css',
})
export class ManageSite implements OnInit {
  siteId: number = 0;
  siteName: string = '';
  loading: boolean = true;
  loadingReservas: boolean = false;

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
  reservas: any[] = [];
  filteredReservas: any[] = [];
  filterStatus: string = 'all';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = +params['id'];
      this.loadSiteInfo();
      this.loadStats();
      this.loadReservas();
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

  loadReservas() {
    this.loadingReservas = true;
    this.reservaService.getReservasBySite(this.siteId)
      .then((data: any[]) => {
        this.reservas = data;
        this.filteredReservas = data;
        this.loadingReservas = false;
      })
      .catch(err => {
        console.error('Error cargando reservas:', err);
        this.reservas = [];
        this.filteredReservas = [];
        this.loadingReservas = false;
      });
  }

  filterReservas(status: string) {
    this.filterStatus = status;
    if (status === 'all') {
      this.filteredReservas = this.reservas;
    } else {
      this.filteredReservas = this.reservas.filter(r => r.status === status);
    }
  }

  cancelReserva(reservaId: number, index: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.cancelReservation(reservaId)
        .then(() => {
          this.reservas.splice(index, 1);
          this.filterReservas(this.filterStatus);
          alert('Reserva cancelada exitosamente.');
        })
        .catch(err => {
          console.error('Error cancelando reserva:', err);
          alert('Error al cancelar la reserva.');
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

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }

  getActiveReservasCount(): number {
    return this.reservas.filter(r => r.status === 'Active').length;
  }

  getCancelledReservasCount(): number {
    return this.reservas.filter(r => r.status === 'Cancelled').length;
  }
}
