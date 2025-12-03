import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourcesService } from '../../../../core/services/resources-service';

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
    private resourcesService: ResourcesService
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

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.siteId = params['id'];
      this.loadCategories();
      this.loadResources();
    });

    // Inicializar tipos expandidos
    this.resourceTypes.forEach(type => {
      this.expandedTypes[type] = true;
    });
  }

  loadCategories() {
    this.resourcesService.getCategories()
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
      alert('Por favor completa todos los campos');
      return;
    }

    if (!this.siteId) {
      alert('Error: No se encontró el sitio');
      return;
    }

    const resourceData = {
      name: this.resourceName,
      resource_type: parseInt(this.resourceType),
      capacity: this.capacity ? parseInt(this.capacity) : null
    };

    this.resourcesService.createResource(this.siteId, resourceData)
      .then((newResource: any) => {
        alert('Recurso creado exitosamente');
        // Recargar recursos para actualizar la lista
        this.loadResources();
        // Limpiar formulario
        this.resourceName = '';
        this.resourceType = '';
        this.capacity = '';
      })
      .catch((error: any) => {
        console.error('Error creating resource:', error);
        alert('Error al crear el recurso: ' + (error?.error?.message || 'Error desconocido'));
      });
  }

  toggleResourceType(type: string) {
    this.expandedTypes[type] = !this.expandedTypes[type];
  }

  selectResource(resource: any) {
    this.selectedResource = this.selectedResource?.id === resource.id ? null : resource;
  }

  editResource(resource: any) {
    // Aquí irá la lógica para editar
  }

  deleteResource(resource: any) {
    // Aquí irá la lógica para eliminar con confirmación
  }

  goBack() {
    this.router.navigate(['/dashboard/sites']);
  }
}
