import { Component } from '@angular/core';
import { GroupService } from '../../../../core/services/group-service';
import { CommonModule } from '@angular/common';
import { GroupFilter } from "../../../../shared/components/filters/group-filter/group-filter";
import { AuthService } from '../../../../core/services/authService';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { Invitations } from '../../../../shared/components/invitations/invitations';
import { ViewGroup } from '../view-group/view-group';

@Component({
  selector: 'app-dash-group',
  imports: [CommonModule, GroupFilter, FormsModule, RouterLink, Invitations, ViewGroup],
  templateUrl: './dash-group.html',
  styleUrl: './dash-group.css',
})
export class DashGroup {
  constructor(private groupService: GroupService, private authService: AuthService, private router: Router) { }

  originalGroups: any = [];
  groups: any = [];
  groupsMembersCount: any = {}; // { groupId: memberCount }
  mostrarFiltros = false;
  user: any;
  search: string = '';

  // CARGA GRUPOS, USUARIO E INVITACIONES

  ngOnInit() {
    this.groupService.getGroups()
      .then(data => {
        this.groups = data;
        this.originalGroups = data;
        // Cargar el conteo de miembros para cada grupo
        return this.loadMembersCountForAllGroups(data);
      })
      .then(() => {
        // Agregar el conteo de miembros a cada grupo
        this.groups = this.groups.map((group: any) => ({
          ...group,
          memberCount: this.groupsMembersCount[group.id] || 0
        }));
        this.originalGroups = this.groups;
      })
      .catch(err => {
        console.error('Error:', err);
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

  loadMembersCountForAllGroups(groups: any[]): Promise<void> {
    const memberPromises = groups.map(group =>
      this.groupService.getGroupMembers(group.id)
        .then((members: any) => {
          this.groupsMembersCount[group.id] = (members?.length || 0) + 1; // +1 por el admin
        })
        .catch(err => {
          console.error(`Error al cargar miembros del grupo ${group.id}:`, err);
          this.groupsMembersCount[group.id] = 0;
        })
    );

    return Promise.all(memberPromises).then(() => {});
  }

  // FILTROS

  filtroActual: string = '';

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

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
    if (filtro === 'members_asc') {
      this.groups = [...this.originalGroups].sort((a: any, b: any) => 
        (a.memberCount || 0) - (b.memberCount || 0)
      );
    }
    if (filtro === 'members_desc') {
      this.groups = [...this.originalGroups].sort((a: any, b: any) => 
        (b.memberCount || 0) - (a.memberCount || 0)
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

  // INVITATIONS

  invitations: any[] = [];
  mostrarInvitaciones = false;

  toggleInvitations() {
    this.mostrarInvitaciones = !this.mostrarInvitaciones;
  }

  // NAVIGATE TO GROUP

  selectedGroupForView: any = null;
  showViewModal: boolean = false;

  navigateToGroup(group: any) {
    if (group.id_owner === this.user?.id) {
      this.router.navigate(['/dashboard/groups/edit', group.id]);
    } else {
      // Mostrar modal en lugar de navegar
      this.selectedGroupForView = group;
      this.showViewModal = true;
    }
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedGroupForView = null;
  }

}
