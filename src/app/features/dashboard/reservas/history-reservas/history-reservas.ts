import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../../core/services/reserva-service';

@Component({
  selector: 'app-history-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-reservas.html',
  styleUrl: './history-reservas.css',
})
export class HistoryReservas implements OnInit {
  constructor(private reservaService: ReservaService) {}

  history: any[] = [];
  historyFiltered: any[] = [];
  search: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.reservaService.getReservasHistory()
      .then(data => {
        this.history = data;
        this.historyFiltered = data;
        this.isLoading = false;
      })
      .catch(err => {
        this.history = [];
        this.historyFiltered = [];
        this.isLoading = false;
        console.error('Error cargando historial:', err);
      });
  }

  filtrarPorNombre(): void {
    const term = this.search.toLowerCase();
    this.historyFiltered = term
      ? this.history.filter((reserva: any) => 
          reserva.Resource?.name.toLowerCase().includes(term) ||
          reserva.Resource?.belongs?.name.toLowerCase().includes(term)
        )
      : this.history;
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

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Active': 'Activa',
      'Cancelled': 'Cancelada',
      'Completed': 'Completada'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
