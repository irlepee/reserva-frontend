import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../../core/services/group-service';
import { AuthService } from '../../../../core/services/authService';
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
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  groupId: string = '';
  groupName: string = '';
  groupDescription: string = '';
  identifier: string = '';
  invitedMembers: any[] = []; // Array de objetos { id, identifier }
  members: any[] = []; // Miembros actuales del grupo
  isLoadingInvite: boolean = false;
  selectedColor: number = 0;
  isLoading: boolean = true;
  currentUser: any = null;

  colors = [
    { id: 0, name: 'Azul', hex: '#0066cc' },
    { id: 1, name: 'Verde', hex: '#28a745' },
    { id: 2, name: 'Rojo', hex: '#dc3545' },
    { id: 3, name: 'Amarillo', hex: '#ffc107' }
  ];

  ngOnInit() {
    // Obtener el usuario actual
    this.authService.fetchCurrentUser()
      .then(user => {
        this.currentUser = user;
      })
      .catch(error => {
        console.error('Error al obtener usuario actual:', error);
      });

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
        
        // Cargar miembros del grupo
        return this.groupService.getGroupMembers(this.groupId);
      })
      .then((members) => {
        console.log('Miembros del grupo cargados:', members);
        this.members = members || [];
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

    // Validar que no intente agregarse a sí mismo
    if (this.currentUser && this.identifier === this.currentUser.username) {
      alert('No puedes agregarte a ti mismo');
      this.identifier = '';
      return;
    }

    this.isLoadingInvite = true;

    this.groupService
      .checkIfuserExists(this.identifier)
      .then((userId: string) => {
        console.log('Usuario existe con ID:', userId);
        
        // Validar que no sea el mismo usuario
        if (this.currentUser && userId === this.currentUser.id) {
          alert('No puedes agregarte a ti mismo');
          this.isLoadingInvite = false;
          return;
        }

        // Verificar si no está duplicado en la lista de invitados
        if (this.invitedMembers.some(m => m.id === userId)) {
          alert('Este usuario ya está en la lista de invitados');
          this.isLoadingInvite = false;
          return;
        }

        // Verificar si el usuario ya está en el grupo
        if (this.members.some(m => m.user?.id === parseInt(userId))) {
          alert('Este usuario ya es integrante del grupo');
          this.isLoadingInvite = false;
          return;
        }

        this.invitedMembers.push({
          id: userId,
          identifier: this.identifier
        });
        this.identifier = '';
        alert('Miembro agregado correctamente');
        this.isLoadingInvite = false;
      })
      .catch((error) => {
        console.error('Error al verificar usuario:', error);
        alert('El usuario no existe');
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

        // Enviar invitaciones si hay miembros a invitar
        if (this.invitedMembers.length > 0) {

          const userIds = this.invitedMembers.map(member => parseInt(member.id));
          
          return this.groupService.inviteUser(this.groupId, userIds)
            .then(() => {
              console.log('Invitaciones enviadas correctamente');
              this.invitedMembers = [];
              this.router.navigate(['/dashboard/groups']);
            });
        } else {
          this.router.navigate(['/dashboard/groups']);
          return Promise.resolve();
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error al actualizar el grupo o enviar invitaciones');
      });
  }

  isAdmin(member: any): boolean {
    // Verificar si el usuario actual es el propietario del grupo (primer miembro)
    return this.currentUser && this.members.length > 0 && this.currentUser.id === this.members[0]?.user?.id;
  }
}
