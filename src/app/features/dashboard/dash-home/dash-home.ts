import { Component } from '@angular/core';
import { DashhomeDataService } from '../../../core/services/dashhome-data-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService';
import { RecommendationService, Recommendation } from '../../../core/services/recommendation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dash-home',
  imports: [CommonModule],
  templateUrl: './dash-home.html',
  styleUrl: './dash-home.css',
})
export class DashHome {
  constructor(
    private dashDataService: DashhomeDataService,
    private authService: AuthService,
    private recommendationService: RecommendationService,
    private router: Router
  ) { }

  topSites: any = null;
  reservas: any = null;
  user: any = null;
  recommendations: Recommendation[] = [];
  isLoadingRecommendations: boolean = false;
  recommendationsError: boolean = false;
  recommendationsErrorMessage: string = '';

  ngOnInit() {
    this.dashDataService.getTopSites()
      .then(data => {
        this.topSites = data;
      })
      .catch(err => {
        this.topSites = null;
      });

    this.dashDataService.getMyReservas()
      .then(data => {
        this.reservas = data;
      })
      .catch(err => {
        this.reservas = null;
      });

    this.authService.fetchCurrentUser()
      .then(data => {
        this.user = data;
      })
      .catch(err => {
        this.user = null;
      });

    this.loadRecommendations();
  }

  // Cargar recomendaciones de la IA
  loadRecommendations() {
    this.isLoadingRecommendations = true;
    this.recommendationsError = false;
    this.recommendationsErrorMessage = '';
    
    this.recommendationService.getRecommendations()
      .subscribe({
        next: (response: any) => {
          this.recommendations = response.recommendations || [];
          this.isLoadingRecommendations = false;
          this.recommendationsError = false;
        },
        error: (err) => {
          this.recommendations = [];
          this.isLoadingRecommendations = false;
          this.recommendationsError = true;
          
          // Mensajes de error más específicos
          if (err.status === 0) {
            this.recommendationsErrorMessage = 'Error de conexión. Por favor verifica tu conexión a internet.';
          } else if (err.status === 500 || err.status === 503) {
            this.recommendationsErrorMessage = 'El servicio de IA tiene problemas. Intenta de nuevo más tarde.';
          } else if (err.status === 408 || err.status === 504) {
            this.recommendationsErrorMessage = 'La solicitud tardó demasiado. Intenta de nuevo.';
          } else {
            this.recommendationsErrorMessage = 'No se pudieron cargar las recomendaciones. Intenta de nuevo.';
          }
        }
      });
  }

  // Reintentar cargar recomendaciones
  retryLoadRecommendations() {
    this.loadRecommendations();
  }

  // Aplicar una recomendación y navegar a crear reserva
  applyRecommendation(recommendation: Recommendation) {
    // Guardar la recomendación para que create-reservation la use
    sessionStorage.setItem('recommendationData', JSON.stringify(recommendation));
    this.router.navigate(['/dashboard/reservas/create']);
  }

  // Navegar a la sección de reservas
  goToReservas() {
    this.router.navigate(['/dashboard/reservas']);
  }

  // Navegar a crear reserva (desde dash-home)
  createReservation() {
    this.router.navigate(['/dashboard/reservas/create']);
  }

  // Navegar a crear reserva en un sitio específico
  goToReserveInSite(site: any) {
    this.router.navigate(['/dashboard/reservas/create'], {
      queryParams: { siteId: site.id }
    });
  }

  // Obtener clase de color para los cards
  getColorClass(index: number): string {
    const colors = ['blue', 'pink', 'green', 'purple'];
    return colors[index % colors.length];
  }

  // Obtener texto del badge
  getBadgeText(index: number): string {
    if (index === 0) return '⭐ Más popular';
    if (index === 1) return '🔥 En tendencia';
    return '✨ Popular';
  }

  // Obtener estado de la reserva (Pronto, En progreso, Finalizada)
  getReservaStatus(reserva: any): string {
    if (!reserva || !reserva.start_date || !reserva.end_date) {
      return 'Pronto';
    }

    const now = new Date();
    const startTime = new Date(reserva.start_date);
    const endTime = new Date(reserva.end_date);

    // Si ya terminó
    if (now > endTime) {
      return 'Finalizada';
    }

    // Si está en progreso
    if (now >= startTime && now < endTime) {
      return 'En progreso';
    }

    // Si es próxima (falta menos de 15 minutos)
    const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);
    if (minutesUntilStart <= 15 && minutesUntilStart > 0) {
      return 'En 15 min';
    }

    // Si es próxima en general
    return 'Pronto';
  }
}