import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
        this.reservas = data;
        this.reservasFiltered = data;
        console.log('Reservas cargadas:', data);
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
      console.log('Cancelando reserva:', reservaId);
      
      this.reservaService.cancelReservation(reservaId)
        .then((response: any) => {
          console.log('Reserva cancelada exitosamente:', response);
          alert('Reserva cancelada exitosamente');
          this.loadReservas();
        })
        .catch((error: any) => {
          console.error('Error al cancelar la reserva:', error);
          alert('Error al cancelar la reserva. Por favor intenta de nuevo.');
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
