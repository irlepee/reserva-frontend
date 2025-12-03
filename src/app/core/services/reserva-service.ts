import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../../shared/interfaces/reserva';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  constructor(private http: HttpClient) { }

  api = 'http://localhost:3000';

  getReservas(): Promise<Reserva[]> {
    return this.http
      .get<Reserva[]>(`${this.api}/reservas`)
      .toPromise()
      .then(r => r ?? []);
  }

  createReservation(reservationData: any): Promise<any> {
    return this.http
      .post<any>(`${this.api}/reservas`, reservationData)
      .toPromise();
  }
}
