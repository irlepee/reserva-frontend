import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../../core/services/group-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-groups',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-groups.html',
  styleUrl: './edit-groups.css',
})
export class EditGroups {
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  groupId: string = '';
  groupName: string = '';
  groupDescription: string = '';
  identifier: string = '';
  invitedMembers: any[] = [];
  isLoadingInvite: boolean = false;
  selectedColor: number = 0;
  isLoading: boolean = true;

  colors = [
    { id: 0, name: 'Azul', hex: '#0066cc' },
    { id: 1, name: 'Verde', hex: '#28a745' },
    { id: 2, name: 'Rojo', hex: '#dc3545' },
    { id: 3, name: 'Amarillo', hex: '#ffc107' }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params['id'];
      this.loadGroupData();
    });
  }

  loadGroupData() {
    this.groupService.getGroupById(this.groupId)
      .then((group) => {
        this.groupName = group.name;
        this.groupDescription = group.description;
        this.selectedColor = group.color;
        // TODO: Cargar miembros invitados también
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error al cargar el grupo:', error);
        this.isLoading = false;
      });
  }

  agregarMiembro() {
    if (!this.identifier.trim()) {
      alert('Por favor ingresa un correo o usuario');
      return;
    }

    this.isLoadingInvite = true;

    this.groupService
      .checkIfuserExists(this.identifier)
      .then((exists) => {
        if (exists) {
          this.invitedMembers.push(this.identifier);
          this.identifier = '';
        } else {
          alert('El usuario no existe');
        }
      })
      .finally(() => {
        this.isLoadingInvite = false;
      });
  }

  quitarMiembro(index: number) {
    this.invitedMembers.splice(index, 1);
  }

  actualizarGrupo() {
    if (!this.groupName.trim()) {
      alert('Por favor ingresa un nombre para el grupo');
      return;
    }

    this.groupService
      .updateGroup(this.groupId, this.groupName, this.groupDescription, this.selectedColor)
      .then(() => {
        alert('Grupo actualizado con éxito');
        this.router.navigate(['/dashboard/groups']);
      })
      .catch((error) => {
        console.log(error);
        alert('Error al actualizar el grupo');
      });
  }
}
