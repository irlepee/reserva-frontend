import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-dash-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dash-reservas.html',
  styleUrl: './dash-reservas.css',
})
export class DashReservas {
  constructor(
    private reservaService: ReservaService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  reservas: any[] = [];
  reservasFiltered: any[] = [];
  search: string = '';

  ngOnInit() {
    this.loadReservas();
  }

  loadReservas() {
    this.reservaService.getReservas()
      .then(data => {
        // Mapear datos de la API al formato esperado por el componente
        this.reservas = data.map((reserva: any) => ({
          ...reserva,
          resource_name: reserva.Resource?.name || reserva.resource_name,
          site_name: reserva.Resource?.belongs?.name || reserva.site_name,
          group_name: reserva.Group?.name || reserva.group_name
        }));
        this.reservasFiltered = this.reservas;
      }).catch(err => {
        this.reservas = [];
        this.reservasFiltered = [];
        console.error('Error cargando reservas:', err);
      });
  }

  filtrarPorNombre(): void {
    const term = this.search.toLowerCase();
    this.reservasFiltered = term
      ? this.reservas.filter((reserva: any) => 
          reserva.resource_name?.toLowerCase().includes(term) ||
          reserva.site_name?.toLowerCase().includes(term)
        )
      : this.reservas;
  }

  createReservation() {
    this.router.navigate(['/dashboard/reservas/create']);
  }

  goToHistory() {
    this.router.navigate(['/dashboard/reservas/history']);
  }

  cancelReservation(reservaId: number) {
    const mensaje = '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.';
    if (confirm(mensaje)) {
      this.reservaService.cancelReservation(reservaId)
        .then((response: any) => {
          this.notificationService.success('Reserva cancelada exitosamente');
          this.loadReservas();
        })
        .catch((error: any) => {
          console.error('Error al cancelar la reserva:', error);
          this.notificationService.error('Error al cancelar la reserva. Por favor intenta de nuevo.');
        });
    }
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  getFormattedTime(date: string): string {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
