import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../../shared/interfaces/reserva';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  constructor(private http: HttpClient) { }

  api = API_CONFIG.apiUrl;

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

  cancelReservation(reservaId: number): Promise<any> {
    return this.http
      .delete<any>(`${this.api}/reservas/${reservaId}`)
      .toPromise();
  }

  getReservasHistory(): Promise<Reserva[]> {
    return this.http
      .get<Reserva[]>(`${this.api}/reservas/history`)
      .toPromise()
      .then(r => r ?? []);
  }

  getOccupiedHours(resourceId: number, date: string): Promise<{ start_hour: string; end_hour: string }[]> {
    return this.http
      .get<{ start_hour: string; end_hour: string }[]>(`${this.api}/reservas/resources/${resourceId}/occupied?date=${date}`)
      .toPromise()
      .then(r => r ?? []);
  }

  getReservasBySite(siteId: number): Promise<any[]> {
    return this.http
      .get<any[]>(`${this.api}/reservas/${siteId}`)
      .toPromise()
      .then(r => r ?? []);
  }
}
