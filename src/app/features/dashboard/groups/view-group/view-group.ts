import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../../core/services/group-service';

@Component({
  selector: 'app-view-group',
  imports: [CommonModule],
  templateUrl: './view-group.html',
  styleUrl: './view-group.css',
})
export class ViewGroup implements OnChanges {
  @Input() groupId: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(private groupService: GroupService) { }

  groupName: string = '';
  groupDescription: string = '';
  groupOwner: any = null;
  members: any[] = [];
  isLoading: boolean = true;
  ownerName: string = '';

  colors = [
    { id: 0, name: 'Azul', hex: '#0066cc' },
    { id: 1, name: 'Verde', hex: '#28a745' },
    { id: 2, name: 'Rojo', hex: '#dc3545' },
    { id: 3, name: 'Amarillo', hex: '#ffc107' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['isOpen'] || changes['groupId']) && this.isOpen && this.groupId) {
      this.loadGroupData();
    }
  }

  loadGroupData() {
    this.isLoading = true;
    this.groupService.getGroupById(this.groupId)
      .then((group) => {
        this.groupName = group.name;
        this.groupDescription = group.description;
        this.groupOwner = group.color;

        // Cargar miembros del grupo
        return this.groupService.getGroupMembers(this.groupId);
      })
      .then((members) => {
        this.members = members || [];

        // Obtener información del administrador del grupo
        return this.groupService.getGroupAdmin(this.groupId);
      })
      .then((adminData) => {
        if (adminData) {
          this.ownerName = adminData.username || 'Usuario desconocido';
          // Agregar el administrador al inicio de la lista de integrantes
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

  closeModal() {
    this.close.emit();
  }

  onBackdropClick(event: any) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  getColorHex(colorId: number): string {
    const color = this.colors.find(c => c.id === colorId);
    return color?.hex || '#0066cc';
  }

  isAdmin(member: any): boolean {
    return this.members.length > 0 && member === this.members[0];
  }
}
