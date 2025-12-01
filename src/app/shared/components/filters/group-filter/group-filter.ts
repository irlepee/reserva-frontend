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
  @Output() ordenar = new EventEmitter<string>();
  @Output() filtroSeleccionado = new EventEmitter<string>();

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.filtroSeleccionado.emit(filter);  // Emitir cuando se selecciona
  }

  selectedFilter: string | null = null;

  cerrarModal() {
    this.cerrar.emit();
  }

  ordenarAsc() {
    this.ordenar.emit('asc');
  }

  ordenarDesc() {
    this.ordenar.emit('desc');
  }
}
