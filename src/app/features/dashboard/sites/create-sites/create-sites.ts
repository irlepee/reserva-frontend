import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocationsService } from '../../../../core/services/locations-service';
import { Entidad } from '../../../../shared/interfaces/entidad';
import { Municipio } from '../../../../shared/interfaces/municipio';
import { Localidad } from '../../../../shared/interfaces/localidad';
import { SiteService } from '../../../../core/services/site-service';

@Component({
  selector: 'app-create-sites',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-sites.html',
  styleUrl: './create-sites.css',
})
export class CreateSites implements OnInit {
  constructor(private ubicacionService: LocationsService, private siteService: SiteService, private router: Router) { }

  siteName: string = '';
  description: string = '';
  uploadedImages: string[] = [];
  isDragging: boolean = false;

  // Autocomplete data
  entidad: string = '';
  entidadId?: number;
  municipio: string = '';
  municipioId?: number;
  localidad: string = '';
  localidadId?: number;

  entidades: Entidad[] = [];
  municipios: Municipio[] = [];
  localidades: Localidad[] = [];

  filtradosEntidad: Entidad[] = [];
  filtradosMunicipio: Municipio[] = [];
  filtradosLocalidad: Localidad[] = [];

  ngOnInit() {
    this.cargarEntidades();
  }

  // --------Entidad----------
  async cargarEntidades() {
    this.ubicacionService.getEntidades().subscribe({
      next: (data) => this.entidades = data,
      error: (err) => console.log(err)
    })
  }

  filtrarEntidad() {
    const term = this.entidad.toLowerCase();
    this.filtradosEntidad = term
      ? this.entidades.filter((e: Entidad) => e.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarEntidad(item: Entidad) {
    this.entidad = item.name.toUpperCase();
    this.entidadId = item.id;
    this.filtradosEntidad = [];
    if (this.entidadId != null) this.cargarMunicipios(this.entidadId);
  }

  // --------Municipio----------
  cargarMunicipios(entidadId: number) {
    this.municipios = [];
    this.municipio = '';
    this.municipioId = undefined;
    this.filtradosMunicipio = [];

    this.ubicacionService.getMunicipios(entidadId).subscribe({
      next: (data: Municipio[]) => this.municipios = data,
      error: (err) => console.error(err)
    });
  }

  filtrarMunicipio() {
    const term = this.municipio.toLowerCase();
    this.filtradosMunicipio = term
      ? this.municipios.filter((m: Municipio) => m.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarMunicipio(item: Municipio) {
    this.municipio = item.name;
    this.municipioId = item.id;
    this.filtradosMunicipio = [];
    if (this.entidadId != null && this.municipioId != null)
      this.cargarLocalidades(this.entidadId, this.municipioId);
  }

  // --------Localidad----------
  cargarLocalidades(entidadId: number, municipioId: number) {
    this.localidades = [];
    this.localidad = '';
    this.localidadId = undefined;
    this.filtradosLocalidad = [];

    this.ubicacionService.getLocalidades(entidadId, municipioId).subscribe({
      next: (data: Localidad[]) => this.localidades = data,
      error: (err) => console.error(err)
    });
  }

  filtrarLocalidad() {
    const term = this.localidad.toLowerCase();
    this.filtradosLocalidad = term
      ? this.localidades.filter((l: Localidad) => l.name.toLowerCase().includes(term))
      : [];
  }

  seleccionarLocalidad(item: Localidad) {
    this.localidad = item.name;
    this.localidadId = item.id;
    this.filtradosLocalidad = [];
  }

  // --------File Upload----------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  processFiles(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      if (this.uploadedImages.length < 3) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.uploadedImages = [...this.uploadedImages, e.target.result as string];
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
  }

  cancelCreate() {
    this.router.navigate(['/dashboard/sites']);
  }

  createSite() {
    this.siteName = this.siteName.trim();
    if (!this.siteName) {
      alert('El nombre del sitio es obligatorio.');
      return;
    }
    const siteData = {
      name: this.siteName,
      description: this.description,
      entidadId: this.entidadId,
      municipioId: this.municipioId,
      localidadId: this.localidadId,
      images: this.uploadedImages
    };

    this.siteService.createSite(siteData)
      .then(() => {
        alert('Sitio creado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error) => {
        alert('Hubo un error al crear el sitio. Por favor, intenta nuevamente.');
      });
  }
}