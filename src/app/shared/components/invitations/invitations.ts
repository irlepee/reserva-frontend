import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../core/services/group-service';

@Component({
  selector: 'app-invitations',
  imports: [CommonModule],
  templateUrl: './invitations.html',
  styleUrl: './invitations.css',
})
export class Invitations implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  invitations: any[] = [];
  cargando = false;
  error: string | null = null;
  procesando: { [key: number]: boolean } = {};
  mensaje: { texto: string; tipo: 'success' | 'error' } | null = null;

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    this.cargarInvitaciones();
  }

  cargarInvitaciones() {
    this.cargando = true;
    this.error = null;
    this.groupService.getInvitations()
      .then(data => {
        console.log('Invitaciones cargadas:', data);
        this.invitations = Array.isArray(data) ? data : [];
      })
      .catch(err => {
        console.error('Error al obtener invitaciones:', err);
        this.error = 'Error al cargar las invitaciones';
        this.invitations = [];
      })
      .finally(() => {
        this.cargando = false;
      });
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  aceptarInvitacion(invitation: any) {
    console.log('Invitación aceptada:', invitation);
    this.procesando[invitation.id] = true;
    
    this.groupService.acceptInvitation(invitation.id)
      .then(() => {
        this.invitations = this.invitations.filter(inv => inv.id !== invitation.id);
        this.mostrarMensaje(`Invitación de "${invitation.name}" aceptada`, 'success');
        this.procesando[invitation.id] = false;
      })
      .catch(err => {
        console.error('Error al aceptar la invitación:', err);
        this.mostrarMensaje('Error al aceptar la invitación', 'error');
        this.procesando[invitation.id] = false;
      });
  }

  rechazarInvitacion(invitation: any) {
    console.log('Invitación rechazada:', invitation);
    this.procesando[invitation.id] = true;
    
    this.groupService.rejectInvitation(invitation.id)
      .then(() => {
        this.invitations = this.invitations.filter(inv => inv.id !== invitation.id);
        this.mostrarMensaje(`Invitación de "${invitation.name}" rechazada`, 'success');
        this.procesando[invitation.id] = false;
      })
      .catch(err => {
        console.error('Error al rechazar la invitación:', err);
        this.mostrarMensaje('Error al rechazar la invitación', 'error');
        this.procesando[invitation.id] = false;
      });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}
