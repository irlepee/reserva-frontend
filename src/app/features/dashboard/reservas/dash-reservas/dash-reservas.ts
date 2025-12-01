import { Component } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash-reservas',
  imports: [CommonModule],
  templateUrl: './dash-reservas.html',
  styleUrl: './dash-reservas.css',
})
export class DashReservas {
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
