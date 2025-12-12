import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocationsService } from '../../../../core/services/locations-service';
import { Entidad } from '../../../../shared/interfaces/entidad';
import { Municipio } from '../../../../shared/interfaces/municipio';
import { Localidad } from '../../../../shared/interfaces/localidad';
import { SiteService } from '../../../../core/services/site-service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-create-sites',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-sites.html',
  styleUrl: './create-sites.css',
})
export class CreateSites implements OnInit {
  constructor(
    private ubicacionService: LocationsService,
    private siteService: SiteService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  siteName: string = '';
  description: string = '';
  uploadedImages: File[] = [];
  imagePreview: string[] = [];
  isDragging: boolean = false;
  openingHour: string = '09:00';
  closingHour: string = '18:00';

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
      error: () => {}
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
        this.uploadedImages = [...this.uploadedImages, file];
        
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreview = [...this.imagePreview, e.target.result as string];
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
    this.imagePreview = this.imagePreview.filter((_, i) => i !== index);
  }

  cancelCreate() {
    this.router.navigate(['/dashboard/sites']);
  }

  createSite() {
    this.siteName = this.siteName.trim();
    if (!this.siteName) {
      this.notificationService.error('El nombre del sitio es obligatorio.');
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.notificationService.error('Debes subir al menos una imagen.');
      return;
    }

    if (!this.entidadId) {
      this.notificationService.error('Debes seleccionar un Estado.');
      return;
    }

    if (!this.municipioId) {
      this.notificationService.error('Debes seleccionar un Municipio.');
      return;
    }

    if (!this.localidadId) {
      this.notificationService.error('Debes seleccionar una Localidad.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.siteName);
    formData.append('description', this.description);
    formData.append('entidadId', this.entidadId.toString());
    formData.append('municipioId', this.municipioId.toString());
    formData.append('localidadId', this.localidadId.toString());
    formData.append('opening_hour', this.openingHour);
    formData.append('closing_hour', this.closingHour);
    this.uploadedImages.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.siteService.createSite(formData)
      .then(() => {
        this.notificationService.success('Sitio creado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error) => {
        this.notificationService.error('Hubo un error al crear el sitio. Por favor, intenta nuevamente.');
      });
  }
} 