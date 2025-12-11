import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationsService } from '../../../../core/services/locations-service';
import { Entidad } from '../../../../shared/interfaces/entidad';
import { Municipio } from '../../../../shared/interfaces/municipio';
import { Localidad } from '../../../../shared/interfaces/localidad';
import { SiteService } from '../../../../core/services/site-service';
import { NotificationService } from '../../../../core/services/notification.service';
import { API_CONFIG } from '../../../../core/config/api.config';

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
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  apiUrl = API_CONFIG.apiUrl;
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
        // Mapear los IDs del backend (id_entidad, id_municipio, id_localidad) a variables locales
        this.entidadId = site.id_entidad;
        this.municipioId = site.id_municipio;
        this.localidadId = site.id_localidad;
        this.existingImages = site.images || [];

        // Cargar todas las ubicaciones y mostrar los nombres correspondientes
        this.ubicacionService.getEntidades().subscribe({
          next: (entidades) => {
            this.entidades = entidades;
            const selectedEntidad = entidades.find(e => e.id === this.entidadId);
            if (selectedEntidad) {
              this.entidad = selectedEntidad.name.toUpperCase();
              
              // Cargar municipios de esa entidad
              this.ubicacionService.getMunicipios(this.entidadId!).subscribe({
                next: (municipios) => {
                  this.municipios = municipios;
                  const selectedMunicipio = municipios.find(m => m.id === this.municipioId);
                  if (selectedMunicipio) {
                    this.municipio = selectedMunicipio.name;
                    
                    // Cargar localidades de ese municipio
                    this.ubicacionService.getLocalidades(this.entidadId!, this.municipioId!).subscribe({
                      next: (localidades) => {
                        this.localidades = localidades;
                        const selectedLocalidad = localidades.find(l => l.id === this.localidadId);
                        if (selectedLocalidad) {
                          this.localidad = selectedLocalidad.name;
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      })
      .catch((error: any) => {
        this.notificationService.error('Error al cargar el sitio.');
        this.router.navigate(['/dashboard/sites']);
      });
  }

  // --------Entidad----------
  cargarEntidades() {
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
      next: (data: Municipio[]) => {
        this.municipios = data;
        
        // Si ya tenemos un municipioId asignado, buscar y asignar su nombre
        if (this.municipioId) {
          const selectedMunicipio = data.find(m => m.id === this.municipioId);
          if (selectedMunicipio) {
            this.municipio = selectedMunicipio.name;
            // Ahora cargar las localidades
            this.cargarLocalidades(entidadId, this.municipioId);
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
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
      next: (data: Localidad[]) => {
        this.localidades = data;
        
        // Si ya tenemos un localidadId asignado, buscar y asignar su nombre
        if (this.localidadId) {
          const selectedLocalidad = data.find(l => l.id === this.localidadId);
          if (selectedLocalidad) {
            this.localidad = selectedLocalidad.name;
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
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
    // Validar que quede al menos una imagen (existente o nueva)
    const totalImagnesRestantes = this.existingImages.length + (this.uploadedImages.length - 1);
    if (totalImagnesRestantes === 0) {
      this.notificationService.warning('Debes mantener al menos una imagen en el sitio.');
      return;
    }
    
    this.uploadedImages = this.uploadedImages.filter((_, i) => i !== index);
    this.imagePreview = this.imagePreview.filter((_, i) => i !== index);
  }

  removeExistingImage(index: number): void {
    // Validar que quede al menos una imagen (existente o nueva)
    const totalImagnesRestantes = this.uploadedImages.length + (this.existingImages.length - 1);
    if (totalImagnesRestantes === 0) {
      this.notificationService.warning('Debes mantener al menos una imagen en el sitio.');
      return;
    }
    
    this.existingImages = this.existingImages.filter((_, i) => i !== index);
  }

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }

  updateSite() {
    this.siteName = this.siteName.trim();
    if (!this.siteName) {
      this.notificationService.error('El nombre del sitio es obligatorio.');
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
    formData.append('id_entidad', this.entidadId.toString());
    formData.append('id_municipio', this.municipioId.toString());
    formData.append('id_localidad', this.localidadId.toString());
    
    // Enviar imágenes existentes como JSON string (no como archivo)
    formData.append('existingImages', JSON.stringify(this.existingImages));

    // Enviar nuevas imágenes (solo archivos nuevos)
    this.uploadedImages.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.siteService.updateSite(this.siteId!, formData)
      .then(() => {
        this.notificationService.success('Sitio actualizado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error: any) => {
        this.notificationService.error('Hubo un error al actualizar el sitio. Por favor, intenta nuevamente.');
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
        this.notificationService.success('Sitio eliminado exitosamente.');
        this.router.navigate(['/dashboard/sites']);
      })
      .catch((error: any) => {
        this.notificationService.error('Hubo un error al eliminar el sitio.');
        this.isLoadingDelete = false;
      });
  }
}
