import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private api = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getEntidades() {
    return this.http.get<any[]>(`${this.api}/entidades`);
  }

  getMunicipios(entidadId: number) {
    return this.http.get<any[]>(`${this.api}/${entidadId}/municipios`);
  }

  getLocalidades(entidadId: number, municipioId: number) {
    return this.http.get<any[]>(`${this.api}/${entidadId}/${municipioId}/localidades`);
  }
}
