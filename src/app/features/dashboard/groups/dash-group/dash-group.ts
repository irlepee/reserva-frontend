import { Component } from '@angular/core';
import { GroupService } from '../../../../core/services/group-service';
import { CommonModule } from '@angular/common';
import { GroupFilter } from "../../../../shared/components/filters/group-filter/group-filter";
import { AuthService } from '../../../../core/services/authService';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-dash-group',
  imports: [CommonModule, GroupFilter, FormsModule, RouterLink],
  templateUrl: './dash-group.html',
  styleUrl: './dash-group.css',
})
export class DashGroup {
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
      })
      .catch(err => {
        this.groups = [];
      });
    this.authService.fetchCurrentUser()
      .then(userData => {
        this.user = userData;
      })
      .catch(err => {
        this.user = null;
      });
  }

  filtroActual: string = '';

  aplicarFiltro(filtro: string) {
    this.filtroActual = filtro;
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
