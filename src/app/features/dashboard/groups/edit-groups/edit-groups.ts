import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../../core/services/group-service';
import { AuthService } from '../../../../core/services/authService';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-edit-groups',
  imports: [CommonModule, FormsModule, ConfirmModal],
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
  groupOwner: any = null;
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

  // CONFIRM MODAL
  showConfirmModal: boolean = false;
  confirmModalConfig: any = {
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDangerous: false
  };
  memberToRemove: any = null;
  isRemovingMember: boolean = false;
  isDeleteGroupAction: boolean = false;
  isDeletingGroup: boolean = false;

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
        this.groupOwner = group.id_owner;

        // Cargar miembros del grupo
        return this.groupService.getGroupMembers(this.groupId);
      })
      .then((members) => {
        console.log('Miembros del grupo cargados:', members);
        this.members = members || [];

        // Obtener información del administrador del grupo
        return this.groupService.getGroupAdmin(this.groupId);
      })
      .then((adminData) => {
        console.log('Información del administrador:', adminData);

        // Agregar el administrador al inicio de la lista de integrantes
        if (adminData) {
          this.members.unshift({
            user: adminData
          });
        }

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

  isAdmin(member: any): boolean {
    return this.members.length > 0 && member === this.members[0];
  }

  removeMemberFromGroup(member: any) {
    this.memberToRemove = member;
    this.confirmModalConfig = {
      title: 'Eliminar miembro',
      message: `¿Está seguro de que desea eliminar a ${member.user.username} del grupo?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDangerous: true
    };
    this.showConfirmModal = true;
  }

  confirmRemoveMember() {
    if (!this.memberToRemove || !this.memberToRemove.user?.id) {
      console.error('No hay miembro seleccionado para eliminar');
      return;
    }

    this.isRemovingMember = true;

    this.groupService.removeMember(this.groupId, this.memberToRemove.user.id.toString())
      .then(() => {
        // Eliminar el miembro de la lista local
        const index = this.members.indexOf(this.memberToRemove);
        if (index > -1) {
          this.members.splice(index, 1);
        }
        alert('Miembro eliminado del grupo correctamente');
        this.closeConfirmModal();
      })
      .catch((error) => {
        console.error('Error al eliminar miembro:', error);
        alert('Error al eliminar el miembro del grupo');
      })
      .finally(() => {
        this.isRemovingMember = false;
      });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.memberToRemove = null;
    this.isDeleteGroupAction = false;
  }

  deleteGroup() {
    this.isDeleteGroupAction = true;
    this.memberToRemove = null;
    this.confirmModalConfig = {
      title: 'Eliminar grupo',
      message: `¿Está seguro de que desea eliminar el grupo "${this.groupName}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar grupo',
      cancelText: 'Cancelar',
      isDangerous: true
    };
    this.showConfirmModal = true;
  }

  confirmDeleteGroup() {
    this.isDeletingGroup = true;

    this.groupService.deleteGroup(this.groupId)
      .then(() => {
        alert('Grupo eliminado correctamente');
        this.router.navigate(['/dashboard/groups']);
      })
      .catch((error) => {
        console.error('Error al eliminar grupo:', error);
        alert('Error al eliminar el grupo');
        this.isDeletingGroup = false;
      });
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

  goBack() {
    this.router.navigate(['/dashboard/groups']);
  }
}

