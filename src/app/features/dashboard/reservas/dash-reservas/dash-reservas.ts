import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva-service';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dash-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
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
          reserva.Resource?.name.toLowerCase().includes(term) ||
          reserva.Resource?.belongs?.name.toLowerCase().includes(term)
        )
      : this.reservas;
  }

  createReservation() {
    this.router.navigate(['/dashboard/reservas/create']);
  }

  cancelReservation(reservaId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      console.log('Cancelando reserva:', reservaId);
      // TODO: Implementar cancelación cuando tengas el endpoint
      alert('Reserva cancelada (simulado)');
      this.loadReservas();
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
