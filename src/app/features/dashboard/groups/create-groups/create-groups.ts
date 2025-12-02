import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../../core/services/group-service';
import { AuthService } from '../../../../core/services/authService';

@Component({
  selector: 'app-create-groups',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-groups.html',
  styleUrl: './create-groups.css',
})
export class CreateGroups {
  constructor(private groupService: GroupService, private authService: AuthService) { }

  groupName: string = '';
  groupDescription: string = '';
  identifier: string = '';
  invitedMembers: any[] = []; // Array de objetos { id, identifier }
  isLoadingInvite: boolean = false;
  selectedColor: number = 0;
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
  }

  crearGrupo() {
    if (!this.groupName.trim()) {
      alert('Por favor ingresa un nombre para el grupo');
      return;
    }

    this.groupService
      .createGroup(this.groupName, this.groupDescription, this.selectedColor)
      .then(() => {
        alert('Grupo creado con exito');
        this.groupName = '';
        this.groupDescription = '';
        this.invitedMembers = [];
        this.selectedColor = 0;
      })
      .catch((error) => {
        alert('Error al crear el grupo');
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

        // Verificar si no está duplicado
        if (this.invitedMembers.some(m => m.id === userId)) {
          alert('Este usuario ya está invitado');
        } else {
          this.invitedMembers.push({
            id: userId,
            identifier: this.identifier
          });
          this.identifier = '';
          alert('Miembro agregado correctamente');
        }
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

}

