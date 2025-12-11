import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourcesService } from '../../../../core/services/resources-service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-manage-resources',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-resources.html',
  styleUrl: './manage-resources.css',
})
export class ManageResources implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resourcesService: ResourcesService,
    private notificationService: NotificationService
  ) { }

  siteId?: number;

  // Form fields
  resourceName: string = '';
  resourceType: string = '';
  capacity: string = '';

  // Resource types - ahora almacenamos id y name
  resourceTypes: any[] = [];
  resourceTypesMap: { [key: number]: string } = {};

  // Resources grouped by type
  resourcesByType: { [key: string]: any[] } = {};

  // Search
  searchTerm: string = '';

  // UI state
  expandedTypes: { [key: string]: boolean } = {};
  selectedResource: any = null;
  isEditing: boolean = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = params['id'];
      // Primero cargar categorías, luego recursos
      this.loadCategories().then(() => {
        this.loadResources();
      });
    });
  }

  loadCategories(): Promise<void> {
    return this.resourcesService.getCategories()
      .then((categories: any[]) => {
        this.resourceTypes = categories;
        
        // Crear mapeo de ID a nombre para referencia rápida
        categories.forEach((category: any) => {
          this.resourceTypesMap[category.id] = category.name;
        });
        
        // Reinicializar tipos expandidos
        categories.forEach((category: any) => {
          this.expandedTypes[category.name] = true;
        });
      })
      .catch((error: any) => {
        console.error('Error loading categories:', error);
      });
  }

  loadResources() {
    if (!this.siteId) return;
    
    this.resourcesService.getResources(this.siteId)
      .then((resources: any[]) => {
        // Agrupar recursos por tipo
        this.resourcesByType = {};
        
        resources.forEach((resource: any) => {
          const typeName = this.getTypeName(resource.resource_type);
          if (!this.resourcesByType[typeName]) {
            this.resourcesByType[typeName] = [];
          }
          this.resourcesByType[typeName].push(resource);
        });
      })
      .catch((error: any) => {
        console.error('Error loading resources:', error);
      });
  }

  getTypeName(resourceTypeId: number): string {
    // Retornar el nombre del tipo del mapeo
    return this.resourceTypesMap[resourceTypeId] || 'Tipo ' + resourceTypeId;
  }

  addResource() {
    if (!this.resourceName.trim() || !this.resourceType) {
      this.notificationService.error('Por favor completa todos los campos');
      return;
    }

    if (!this.siteId) {
      this.notificationService.error('Error: No se encontró el sitio');
      return;
    }

    const resourceData = {
      name: this.resourceName,
      resource_type: parseInt(this.resourceType),
      capacity: this.capacity ? parseInt(this.capacity) : 1
    };

    if (this.isEditing && this.selectedResource) {
      // Editar recurso existente
      this.resourcesService.editResource(this.siteId, this.selectedResource.id, resourceData)
        .then((updatedResource: any) => {
          this.notificationService.success('Recurso actualizado exitosamente');
          // Recargar recursos para actualizar la lista
          this.loadResources();
          // Limpiar formulario
          this.clearForm();
        })
        .catch((error: any) => {
          console.error('Error updating resource:', error);
          this.notificationService.error('Error al actualizar el recurso: ' + (error?.error?.message || 'Error desconocido'));
        });
    } else {
      // Crear nuevo recurso
      this.resourcesService.createResource(this.siteId, resourceData)
        .then((newResource: any) => {
          this.notificationService.success('Recurso creado exitosamente');
          // Recargar recursos para actualizar la lista
          this.loadResources();
          // Limpiar formulario
          this.clearForm();
        })
        .catch((error: any) => {
          console.error('Error creating resource:', error);
          this.notificationService.error('Error al crear el recurso: ' + (error?.error?.message || 'Error desconocido'));
        });
    }
  }

  toggleResourceType(type: string) {
    this.expandedTypes[type] = !this.expandedTypes[type];
  }

  selectResource(resource: any) {
    this.selectedResource = this.selectedResource?.id === resource.id ? null : resource;
  }

  clearForm() {
    this.resourceName = '';
    this.resourceType = '';
    this.capacity = '';
    this.selectedResource = null;
    this.isEditing = false;
  }

  cancelEdit() {
    this.clearForm();
  }

  editResource(resource: any) {
    this.selectedResource = resource;
    this.isEditing = true;
    this.resourceName = resource.name;
    this.resourceType = resource.resource_type.toString();
    this.capacity = resource.capacity ? resource.capacity.toString() : '';
    // Hacer scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteResource(resource: any) {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el recurso "${resource.name}"? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) {
      return;
    }

    if (!this.siteId) {
      this.notificationService.error('Error: No se encontró el sitio');
      return;
    }

    this.resourcesService.deleteResource(this.siteId, resource.id)
      .then((response: any) => {
        this.notificationService.success('Recurso eliminado exitosamente');
        // Recargar recursos para actualizar la lista
        this.loadResources();
        // Si era el recurso que estabas editando, limpiar formulario
        if (this.selectedResource?.id === resource.id) {
          this.clearForm();
        }
      })
      .catch((error: any) => {
        console.error('Error deleting resource:', error);
        this.notificationService.error('Error al eliminar el recurso: ' + (error?.error?.message || 'Error desconocido'));
      });
  }

  getResourcesWithCount(): any[] {
    // Retornar solo los tipos que tienen recursos y que coinciden con el filtro
    return this.resourceTypes.filter(type => {
      const filteredResources = this.getFilteredResources(type.name);
      return filteredResources && filteredResources.length > 0;
    });
  }

  getFilteredResources(typeName: string): any[] {
    // Obtener recursos del tipo y filtrar por searchTerm
    const resources = this.resourcesByType[typeName] || [];
    
    if (!this.searchTerm.trim()) {
      return resources;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return resources.filter((resource: any) =>
      resource.name.toLowerCase().includes(searchLower)
    );
  }

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }
}
