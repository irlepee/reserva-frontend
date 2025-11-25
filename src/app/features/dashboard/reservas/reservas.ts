import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../../core/services/reserva-service';

@Component({
  selector: 'app-reservas',
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas {
  constructor(private reservaService: ReservaService) { }

  reservas: any[] = [];

  ngOnInit() {
    this.reservaService.getReservas()
      .then(data => {
        this.reservas = data;
        console.log(data);
      }).catch(err => {
        this.reservas = [];
        console.log(err);
      });
  }
}
