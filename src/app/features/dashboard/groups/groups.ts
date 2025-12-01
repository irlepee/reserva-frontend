import { Component } from '@angular/core';
import { GroupService } from '../../../core/services/group-service';
import { CommonModule } from '@angular/common';
import { GroupFilter } from "../../../shared/components/filters/group-filter/group-filter";
import { AuthService } from '../../../core/services/authService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, GroupFilter, FormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {
  constructor(private groupService: GroupService, private authService: AuthService) { }

  originalGroups: any = [];
  groups: any = [];
  mostrarFiltros = false;
  user: any;
  search: string = '';

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  ngOnInit() {
    this.groupService.getGroups()
      .then(data => {
        this.groups = data;
        this.originalGroups = data;
        console.log(data);
      })
      .catch(err => {
        console.log(err);
        this.groups = [];
      });
    this.authService.fetchCurrentUser()
      .then(userData => {
        this.user = userData;
        console.log('Usuario actual:', this.user);
      })
      .catch(err => {
        console.log('Error al obtener el usuario actual:', err);
      });
  }

  filtroActual: string = '';

  aplicarFiltro(filtro: string) {
    this.filtroActual = filtro;
    // Aquí va tu lógica de filtrado
    // Por ejemplo:
    // if (filtro === 'todos') { ... }
    // if (filtro === 'creados') { ... }
    // if (filtro === 'otros') { ... }
    if (filtro === 'all') {
      this.groups = this.originalGroups;
    }
    if (filtro === 'created') {
      this.groups = this.originalGroups.filter(
        (group: any) => group.id_owner === this.user.id
      );
    }
    if (filtro === 'others') {
      this.groups = this.originalGroups.filter(
        (group: any) => group.id_owner !== this.user.id
      );
    }

  }

  filtrarPorNombre() {
    if (this.search.trim() === '') {
      this.groups = this.originalGroups;
    } else {
      this.groups = this.originalGroups.filter(
        (group: any) => group.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }
}