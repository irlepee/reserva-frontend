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
}