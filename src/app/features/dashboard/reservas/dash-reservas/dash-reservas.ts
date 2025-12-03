import { Component } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dash-reservas',
  imports: [CommonModule],
  templateUrl: './dash-reservas.html',
  styleUrl: './dash-reservas.css',
})
export class DashReservas {
  constructor(
    private reservaService: ReservaService,
    private router: Router
  ) { }

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

  createReservation() {
    this.router.navigate(['/dashboard/reservas/create']);
  }
}
