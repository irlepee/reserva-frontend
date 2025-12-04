import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/services/authService';
import { HttpClientModule } from '@angular/common/http';
import { LocationsService } from '../../core/services/locations-service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import { Entidad } from '../../shared/interfaces/entidad';
import { Municipio } from '../../shared/interfaces/municipio';
import { Localidad } from '../../shared/interfaces/localidad';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})

export class Auth {

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  // ---------------------Tabs---------------------

  activeTab: 'login' | 'register' = 'login';

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  // ---------------------Login---------------------

  identifier = "";
  password = "";

  constructor(
    private authenticator: AuthService,
    private ubicacionService: LocationsService,
    private router: Router
  ) { }

  async onLogin(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    try {
      const result: any = await this.authenticator.login({
        identifier: this.identifier,
        password: this.password
      });

      localStorage.setItem('token', result.token);

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(error);
    }
  }

  // ---------------------Autocomplete---------------------

  ngOnInit() {
    this.cargarEntidades();
  }

  entidad = '';
  entidadId?: number;
  municipio = '';
  municipioId?: number;
  localidad = '';
  localidadId?: number;

  entidades: Entidad[] = [];
  municipios: Municipio[] = [];
  localidades: Localidad[] = [];

  filtradosEntidad: Entidad[] = [];
  filtradosMunicipio: Municipio[] = [];
  filtradosLocalidad: Localidad[] = [];

  // --------Entidad---------- 163

  async cargarEntidades() {
    this.ubicacionService.getEntidades().subscribe({
      next: (data) => this.entidades = data,
      error: () => {}
    })
  }

  filtrarEntidad() {
    const term = this.entidad.toLowerCase();
    this.filtradosEntidad = term
      ? this.entidades.filter((e: Entidad) => e.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarEntidad(item: Entidad) {
    this.entidad = item.name.toUpperCase();
    this.entidadId = item.id;
    this.filtradosEntidad = [];
    if (this.entidadId != null) this.cargarMunicipios(this.entidadId);
  }

  // --------Municipio----------

  cargarMunicipios(entidadId: number) {
    this.municipios = [];
    this.municipio = '';
    this.municipioId = undefined;
    this.filtradosMunicipio = [];

    this.ubicacionService.getMunicipios(entidadId).subscribe({
      next: (data: Municipio[]) => this.municipios = data,
      error: (err) => console.error(err)
    });
  }


  filtrarMunicipio() {
    const term = this.municipio.toLowerCase();
    this.filtradosMunicipio = term
      ? this.municipios.filter((m: Municipio) => m.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarMunicipio(item: Municipio) {
    this.municipio = item.name;
    this.municipioId = item.id;
    this.filtradosMunicipio = [];
    if (this.entidadId != null && this.municipioId != null)
      this.cargarLocalidades(this.entidadId, this.municipioId);
  }

  // --------Localidad----------

  cargarLocalidades(entidadId: number, municipioId: number) {
    this.localidades = [];
    this.localidad = '';
    this.localidadId = undefined;
    this.filtradosLocalidad = [];

    this.ubicacionService.getLocalidades(entidadId, municipioId).subscribe({
      next: (data: Localidad[]) => this.localidades = data,
      error: (err) => console.error(err)
    });
  }

  filtrarLocalidad() {
    const term = this.localidad.toLowerCase();
    this.filtradosLocalidad = term
      ? this.localidades.filter((l: Localidad) => l.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarLocalidad(item: Localidad) {
    this.localidad = item.name;
    this.localidadId = item.id;
    this.filtradosLocalidad = [];
  }

  // ---------------------Register---------------------

  name = '';
  lastname = '';
  email = '';
  username = '';
  passwordRegister = '';
  password2Register = '';
  age = 0;
  gender = '';

  registroExitoso = false;

  async onRegister(form: any) {
    if (form.invalid) {
      form.control.markAllAsTouched(); // Marca todos los campos como “touched”
      return; // no sigue hasta que todos sean válidos
    }

    try {
      const data = {
        name: this.name,
        lastname: this.lastname,
        age: this.age,
        gender: this.gender,
        email: this.email,
        username: this.username,
        password: this.passwordRegister,
        id_entidad: this.entidadId,
        id_municipio: this.municipioId,
        id_localidad: this.localidadId
      };

      await this.authenticator.register(data);
    } catch (error: any) {
      console.error('Error en registro:', error.error?.error || 'Ocurrió un error desconocido');
      alert('Error en registro: ' + error.error?.error || 'Ocurrió un error desconocido');
    }
  }

}
