import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-group-filter',
  standalone: true,
  imports: [],
  templateUrl: './group-filter.html',
  styleUrls: ['./group-filter.css'],
})
export class GroupFilter {

  @Output() cerrar = new EventEmitter<void>();
  @Output() filtroSeleccionado = new EventEmitter<string>();

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.filtroSeleccionado.emit(filter);  // Emitir cuando se selecciona
  }

  selectedFilter: string | null = null;

  cerrarModal() {
    this.cerrar.emit();
  }

  ordenarPorMiembrosAsc() {
    this.selectedFilter = 'members_asc';
    this.filtroSeleccionado.emit('members_asc');
  }

  ordenarPorMiembrosDesc() {
    this.selectedFilter = 'members_desc';
    this.filtroSeleccionado.emit('members_desc');
  }
}
