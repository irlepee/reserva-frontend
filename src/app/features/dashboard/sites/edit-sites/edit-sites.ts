import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationsService } from '../../../../core/services/locations-service';
import { Entidad } from '../../../../shared/interfaces/entidad';
import { Municipio } from '../../../../shared/interfaces/municipio';
import { Localidad } from '../../../../shared/interfaces/localidad';
import { SiteService } from '../../../../core/services/site-service';

@Component({
  selector: 'app-edit-sites',
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-sites.html',
  styleUrl: './edit-sites.css',
})
export class EditSites implements OnInit {
  constructor(
    private ubicacionService: LocationsService,
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  siteId?: number;
  siteName: string = '';
  description: string = '';
  uploadedImages: File[] = [];
  imagePreview: string[] = [];
  existingImages: string[] = [];
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

  // Modal
  showDeleteModal = false;
  isLoadingDelete = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = params['id'];
      if (this.siteId) {
        this.loadSiteData();
      }
    });
    this.cargarEntidades();
  }

  loadSiteData() {
    this.siteService.getSiteById(this.siteId!)
      .then((site: any) => {
        this.siteName = site.name;
        this.description = site.description || '';
        this.entidadId = site.entidadId;
        this.municipioId = site.municipioId;
        this.localidadId = site.localidadId;
        this.existingImages = site.images || [];

        if (this.entidadId) {
          this.ubicacionService.getEntidades().subscribe({
            next: (entidades) => {
              const selectedEntidad = entidades.find(e => e.id === this.entidadId);
              if (selectedEntidad) {
                this.entidad = selectedEntidad.name.toUpperCase();
                this.cargarMunicipios(this.entidadId!);
              }
            }
          });
        }
      })
      .catch((error: any) => {
        alert('Error al cargar el sitio.');
        this.router.navigate(['/dashboard/sites']);
      });
  }

  // --------Entidad----------
  cargarEntidades() {
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
    const maxAllowed = 3 - this.existingImages.length;

    imageFiles.forEach(file => {
      if (this.uploadedImages.length < maxAllowed) {
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

  removeNewImage(index: number): void {
    this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
    this.imagePreview = this.imagePreview.filter((_, i) => i !== index);
  }

  removeExistingImage(index: number): void {
    this.existingImages = this.existingImages.filter((_, i) => i !== index);
  }

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }

  updateSite() {
    this.siteName = this.siteName.trim();
    if (!this.siteName) {
      alert('El nombre del sitio es obligatorio.');
      return;
    }

    if (!this.entidadId) {
      alert('Debes seleccionar un Estado.');
      return;
    }

    if (!this.municipioId) {
      alert('Debes seleccionar un Municipio.');
      return;
    }

    if (!this.localidadId) {
      alert('Debes seleccionar una Localidad.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.siteName);
    formData.append('description', this.description);
    formData.append('entidadId', this.entidadId.toString());
    formData.append('municipioId', this.municipioId.toString());
    formData.append('localidadId', this.localidadId.toString());
    
    // Enviar imágenes existentes
    this.existingImages.forEach((image, index) => {
      formData.append(`existingImages`, image);
    });

    // Enviar nuevas imágenes
    this.uploadedImages.forEach((file) => {
      formData.append('newImages', file, file.name);
    });

    this.siteService.updateSite(this.siteId!, formData)
      .then(() => {
        alert('Sitio actualizado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error: any) => {
        alert('Hubo un error al actualizar el sitio. Por favor, intenta nuevamente.');
      });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDeleteSite() {
    this.isLoadingDelete = true;
    this.siteService.deleteSite(this.siteId!)
      .then(() => {
        alert('Sitio eliminado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error: any) => {
        alert('Hubo un error al eliminar el sitio.');
        this.isLoadingDelete = false;
      });
  }
}
