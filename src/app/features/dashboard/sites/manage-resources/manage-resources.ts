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

  // Resource types
  resourceTypes: string[] = [];

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
        this.resourceTypes = categories.map((c: any) => c.name);
        
        // Reinicializar tipos expandidos
        this.resourceTypes.forEach(type => {
          this.expandedTypes[type] = true;
        });
      })
      .catch((error: any) => {
        console.error('Error loading categories:', error);
      });
  }

  loadResources() {
    // Aquí irá la lógica para cargar recursos
    // Por ahora, datos de ejemplo
  }

  addResource() {
    if (!this.resourceName.trim() || !this.resourceType) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Aquí irá la lógica para agregar recurso
    console.log('Agregando recurso:', {
      name: this.resourceName,
      type: this.resourceType,
      capacity: this.capacity
    });

    this.resourceName = '';
    this.resourceType = '';
    this.capacity = '';
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
