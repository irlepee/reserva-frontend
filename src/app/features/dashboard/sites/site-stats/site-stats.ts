import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../../../core/services/site-service';

@Component({
  selector: 'app-site-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-stats.html',
  styleUrl: './site-stats.css',
})
export class SiteStats implements OnInit {
  siteId: number = 0;
  siteName: string = '';
  loading: boolean = true;

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
    
    // Reservas por semana (últimas 8 semanas)
    reservasPorSemana: [] as { semana: string; cantidad: number }[],
    
    // Horas más populares
    horasPopulares: [] as { hora: string; cantidad: number }[],
    
    // Tipos de reserva
    tiposReserva: {
      individuales: 0,
      grupales: 0
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = +params['id'];
      this.loadSiteInfo();
      this.loadStats();
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
        
        if (data.reservasPorSemana) {
          this.stats.reservasPorSemana = data.reservasPorSemana;
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

  // Obtener el valor máximo para escalar las barras
  getMaxReservasDia(): number {
    return Math.max(...this.stats.reservasPorDia.map(d => d.cantidad), 1);
  }

  getMaxReservasSemana(): number {
    return Math.max(...this.stats.reservasPorSemana.map(s => s.cantidad), 1);
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
}
