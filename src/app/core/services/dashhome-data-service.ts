import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../../shared/interfaces/reserva';

@Injectable({
  providedIn: 'root',
})
export class DashhomeDataService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getTopSites(): Promise<any> {
    return this.http.get<any[]>(`${this.api}/reservas/topSites`).toPromise();
  }

  getMyReservas(): Promise<Reserva[]> {
    return this.http
      .get<Reserva[]>(`${this.api}/reservas`)
      .toPromise()
      .then(r => r ?? []);
  }


}
