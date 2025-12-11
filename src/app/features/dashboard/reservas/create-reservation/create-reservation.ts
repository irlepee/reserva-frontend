import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SiteService } from '../../../../core/services/site-service';
import { ResourcesService } from '../../../../core/services/resources-service';
import { ReservaService } from '../../../../core/services/reserva-service';
import { GroupService } from '../../../../core/services/group-service';
import { AuthService } from '../../../../core/services/authService';
import { NotificationService } from '../../../../core/services/notification.service';
import { Recommendation } from '../../../../core/services/recommendation.service';
import { API_CONFIG } from '../../../../core/config/api.config';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-reservation.html',
  styleUrl: './create-reservation.css',
})
export class CreateReservationComponent implements OnInit {
  constructor(
    private siteService: SiteService,
    private resourcesService: ResourcesService,
    private reservaService: ReservaService,
    private groupService: GroupService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  // PASO 1: Búsqueda y selección de sitio
  searchTerm: string = '';
  searchedSites: any[] = [];
  selectedSite: any = null;
  isSearching: boolean = false;

  // PASO 2: Selección de recurso
  siteResources: any[] = [];
  resourcesByCategory: Map<string, any[]> = new Map();
  resourceTypesMap: { [key: number]: string } = {};
  categories: string[] = [];
  selectedResource: any = null;

  // PASO 3: Calendario y horario
  selectedDate: string = '';
  startTime: string = '09:00';
  endTime: string = '10:00';
  currentCalendarDate: Date = new Date();
  occupiedHours: { start_hour: string; end_hour: string }[] = [];
  isLoadingHours: boolean = false;

  // PASO 4: Selección de tipo de reserva (personal o grupo)
  reservationType: 'personal' | 'group' = 'personal';
  myGroups: any[] = [];
  selectedGroup: any = null;
  groupMembers: any[] = [];
  isLoadingGroups: boolean = false;
  showCapacityWarning: boolean = false;
  currentUser: any = null;

  // Estados de paso
  step: 'search' | 'resources' | 'datetime' | 'summary' = 'search';

  // URL de la API para imágenes
  apiUrl = API_CONFIG.apiUrl;

  ngOnInit() {
    this.loadCategories();
    this.loadCurrentUserAndGroups();
    this.loadRecommendationFromSession();
  }

  // Cargar recomendación desde sessionStorage si existe
  loadRecommendationFromSession() {
    const recData = sessionStorage.getItem('recommendationData');
    if (recData) {
      try {
        const recommendation: Recommendation = JSON.parse(recData);
        
        // Buscar el sitio
        this.siteService.getPublicSites()
          .then((sites: any[]) => {
            const matchingSite = sites.find(s => 
              s.name.toLowerCase().includes(recommendation.site.toLowerCase())
            );
            
            if (matchingSite) {
              this.selectedSite = matchingSite;
              this.loadSiteResources();
              
              // Establecer hora y duración
              this.startTime = `${String(recommendation.suggestedHour).padStart(2, '0')}:00`;
              const endHour = recommendation.suggestedHour + recommendation.suggestedDuration;
              this.endTime = `${String(endHour).padStart(2, '0')}:00`;
              
              // Buscar el recurso y seleccionarlo
              setTimeout(() => {
                const matchingResource = this.siteResources.find(r => 
                  r.name.toLowerCase() === recommendation.resourceName.toLowerCase()
                );
                if (matchingResource) {
                  this.selectedResource = matchingResource;
                  this.selectedDate = new Date().toISOString().split('T')[0];
                  this.step = 'summary';
                }
              }, 500);
            } else {
              this.notificationService.error('No se pudo cargar la recomendación');
            }
          })
          .catch((err) => {
            this.notificationService.error('No se pudo cargar la recomendación');
          })
          .finally(() => {
            sessionStorage.removeItem('recommendationData');
          });
      } catch (error) {
        sessionStorage.removeItem('recommendationData');
      }
    }
  }

  // Cargar usuario actual y luego sus grupos
  loadCurrentUserAndGroups() {
    this.isLoadingGroups = true;
    this.authService.fetchCurrentUser()
      .then((user: any) => {
        this.currentUser = user;
        return this.groupService.getGroups();
      })
      .then((groups: any[]) => {
        // Filtrar solo los grupos donde el usuario es dueño
        if (this.currentUser) {
          this.myGroups = groups.filter(g => g.id_owner === this.currentUser.id);
        } else {
          this.myGroups = [];
        }
        this.isLoadingGroups = false;
      })
      .catch(() => {
        this.myGroups = [];
        this.isLoadingGroups = false;
      });
  }

  // Cargar categorías desde el backend
  loadCategories() {
    this.resourcesService.getCategories()
      .then((categories: any[]) => {
        // Crear mapeo de ID a nombre para referencia rápida
        categories.forEach((category: any) => {
          this.resourceTypesMap[category.id] = category.name;
        });
      })
      .catch(() => {
        this.resourceTypesMap = {};
      });
  }

  // Obtener nombre del tipo de recurso por ID
  getTypeName(resourceTypeId: number): string {
    return this.resourceTypesMap[resourceTypeId] || 'Sin categoría';
  }

  // Obtener icono correspondiente a la categoría
  getCategoryIcon(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('aula')) {
      return 'bi bi-door-closed';
    }
    if (lowerCategory.includes('equipamiento')) {
      return 'bi bi-tools';
    }
    if (lowerCategory.includes('cubículo') || lowerCategory.includes('cubiculo')) {
      return 'bi bi-layout-split';
    }
    if (lowerCategory.includes('computadora') || lowerCategory.includes('computador')) {
      return 'bi bi-laptop';
    }
    if (lowerCategory.includes('espacio específico')) {
      return 'bi bi-easel2';
    }
    if (lowerCategory.includes('auditorio') || lowerCategory.includes('auditor')) {
      return 'bi bi-mic';
    }
    if (lowerCategory.includes('otro')) {
      return 'bi bi-box';
    }
    
    return 'bi bi-box';
  }

  // Obtener URL de imagen del sitio
  getImageUrl(images: any): string {
    if (!images || images.length === 0) {
      return '';
    }
    
    const firstImage = images[0];
    
    // Si ya es una URL completa
    if (firstImage.startsWith('http')) {
      return firstImage;
    }
    
    // Si es un nombre de archivo, construir la URL
    return `${this.apiUrl}${firstImage}`;
  }

  // Obtener todas las URLs de imágenes del sitio
  getAllImageUrls(images: any): string[] {
    if (!images || images.length === 0) {
      return [];
    }
    
    return images.map((img: string) => {
      if (img.startsWith('http')) {
        return img;
      }
      return `${this.apiUrl}${img}`;
    });
  }

  // PASO 1: Búsqueda de sitios
  searchSites() {
    if (!this.searchTerm.trim()) {
      this.searchedSites = [];
      return;
    }

    this.isSearching = true;
    
    this.siteService.getPublicSites()
      .then((sites: any[]) => {
        const term = this.searchTerm.toLowerCase();
        this.searchedSites = sites.filter(site =>
          site.name.toLowerCase().includes(term)
        );
        this.isSearching = false;
      })
      .catch((error: any) => {
        this.searchedSites = [];
        this.isSearching = false;
      });
  }

  selectSite(site: any) {
    this.selectedSite = site;
    this.step = 'resources';
    this.loadSiteResources();
  }

  loadSiteResources() {
    if (!this.selectedSite) return;
    
    this.siteService.getPublicResources(this.selectedSite.id)
      .then((resources: any[]) => {
        this.siteResources = resources;
        this.organizeResourcesByCategory(resources);
      })
      .catch((error: any) => {
        this.siteResources = [];
        this.resourcesByCategory = new Map();
        this.categories = [];
      });
  }

  // Organizar recursos por categoría
  organizeResourcesByCategory(resources: any[]) {
    this.resourcesByCategory = new Map();
    
    resources.forEach(resource => {
      const categoryName = this.getTypeName(resource.resource_type);
      
      if (!this.resourcesByCategory.has(categoryName)) {
        this.resourcesByCategory.set(categoryName, []);
      }
      this.resourcesByCategory.get(categoryName)?.push(resource);
    });
    
    this.categories = Array.from(this.resourcesByCategory.keys());
  }

  getResourcesByCategory(category: string): any[] {
    return this.resourcesByCategory.get(category) || [];
  }

  // PASO 2: Selección de recurso
  selectResource(resource: any) {
    this.selectedResource = resource;
    this.step = 'datetime';
  }

  // PASO 3: Calendario
  getCalendarDays() {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }

  previousMonth() {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() - 1
    );
  }

  nextMonth() {
    this.currentCalendarDate = new Date(
      this.currentCalendarDate.getFullYear(),
      this.currentCalendarDate.getMonth() + 1
    );
  }

  selectDate(day: number | null) {
    if (!day) return;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    this.selectedDate = new Date(year, month, day).toISOString().split('T')[0];
    
    // Cargar horas ocupadas para este recurso y fecha
    this.loadOccupiedHours();
  }

  loadOccupiedHours() {
    if (!this.selectedResource || !this.selectedDate) return;
    
    this.isLoadingHours = true;
    // Limpiar selección previa al cambiar de fecha
    this.startTime = '';
    this.endTime = '';
    
    this.reservaService.getOccupiedHours(this.selectedResource.id, this.selectedDate)
      .then((response: any) => {
        // Manejar el formato de respuesta: { date, occupied_hours: [{ start, end }] }
        if (response && Array.isArray(response.occupied_hours)) {
          // Convertir al formato que usamos internamente
          this.occupiedHours = response.occupied_hours.map((h: any) => ({
            start_hour: String(h.start).padStart(2, '0'),
            end_hour: String(h.end).padStart(2, '0')
          }));
        } else if (Array.isArray(response)) {
          this.occupiedHours = response;
        } else {
          this.occupiedHours = [];
        }
        this.isLoadingHours = false;
      })
      .catch((error) => {
        this.occupiedHours = [];
        this.isLoadingHours = false;
      });
  }

  isDateSelected(day: number | null): boolean {
    if (!day || !this.selectedDate) return false;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return dateStr === this.selectedDate;
  }

  isDateDisabled(day: number | null): boolean {
    if (!day) return true;
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  }

  goToSummary() {
    if (!this.selectedDate) {
      this.notificationService.error('Por favor selecciona una fecha');
      return;
    }

    if (!this.validateTimes()) {
      return;
    }

    // Resetear la selección de grupo al entrar al resumen
    this.reservationType = 'personal';
    this.selectedGroup = null;
    this.groupMembers = [];
    this.showCapacityWarning = false;

    this.step = 'summary';
  }

  // Cambiar tipo de reserva
  onReservationTypeChange() {
    if (this.reservationType === 'personal') {
      this.selectedGroup = null;
      this.groupMembers = [];
      this.showCapacityWarning = false;
    }
  }

  // Seleccionar grupo
  onGroupSelect() {
    if (!this.selectedGroup) {
      this.groupMembers = [];
      this.showCapacityWarning = false;
      return;
    }

    // Cargar miembros del grupo seleccionado
    this.groupService.getGroupMembers(this.selectedGroup.id.toString())
      .then((members: any[]) => {
        this.groupMembers = members || [];
        // Agregar el dueño del grupo (que no está en members)
        const totalMembers = this.groupMembers.length + 1; // +1 por el dueño
        
        // Verificar capacidad
        const capacity = this.selectedResource?.capacity || 0;
        if (capacity > 0 && totalMembers > capacity) {
          this.showCapacityWarning = true;
        } else {
          this.showCapacityWarning = false;
        }
      })
      .catch(() => {
        this.groupMembers = [];
        this.showCapacityWarning = false;
      });
  }

  // Obtener total de miembros del grupo (incluyendo dueño)
  getTotalGroupMembers(): number {
    return this.groupMembers.length + 1; // +1 por el dueño
  }

  // Confirmar reserva con advertencia de capacidad
  confirmCapacityWarning() {
    this.showCapacityWarning = false;
  }

  validateTimes(): boolean {
    // Validar que la hora de inicio sea antes que la de fin
    if (this.startTime >= this.endTime) {
      this.notificationService.error('La hora de inicio debe ser anterior a la hora de fin');
      return false;
    }

    // Validar que no sea una reserva en el pasado
    const now = new Date();
    const startHour = parseInt(this.startTime);
    
    // Parsear la fecha seleccionada correctamente en hora local
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const selectedDateTime = new Date(year, month - 1, day, startHour, 0, 0, 0);

    if (selectedDateTime <= now) {
      this.notificationService.error('No puedes hacer una reserva en el pasado');
      return false;
    }

    // Validar duración mínima (al menos 1 hora)
    const startHourInt = parseInt(this.startTime);
    const endHourInt = parseInt(this.endTime);
    const duration = endHourInt - startHourInt;

    if (duration < 1) {
      this.notificationService.error('La reserva debe ser por lo menos 1 hora');
      return false;
    }

    return true;
  }

  getMinStartTime(): string {
    if (!this.selectedDate) return '00:00';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Si es hoy, la hora mínima es la actual
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return '00:00';
  }

  // PASO 3: Calendario
  calculateDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    const startHour = parseInt(this.startTime);
    const endHour = parseInt(this.endTime);
    return endHour - startHour;
  }

  // Generar slots de horas para la grilla visual
  getHourSlots(): { hour: string; occupied: boolean; past: boolean }[] {
    const slots: { hour: string; occupied: boolean; past: boolean }[] = [];
    
    if (!this.selectedDate) return slots;
    
    const today = new Date();
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const isToday = selectedDate.getTime() === today.getTime();
    const currentHour = new Date().getHours();
    
    // Asegurar que occupiedHours sea un array
    const occupied = Array.isArray(this.occupiedHours) ? this.occupiedHours : [];

    for (let i = 0; i < 24; i++) {
      const hourStr = String(i).padStart(2, '0');
      
      // Verificar si esta hora está ocupada
      const isOccupied = occupied.some(occ => {
        const occupiedStart = parseInt(occ.start_hour);
        const occupiedEnd = parseInt(occ.end_hour);
        return i >= occupiedStart && i < occupiedEnd;
      });
      
      // Verificar si es una hora pasada (solo aplica para hoy)
      const isPast = isToday && i <= currentHour;
      
      slots.push({
        hour: hourStr,
        occupied: isOccupied,
        past: isPast
      });
    }

    return slots;
  }

  // Verificar si una hora está dentro del rango seleccionado
  isHourInRange(hour: string): boolean {
    if (!this.startTime) return false;
    const h = parseInt(hour);
    const start = parseInt(this.startTime);
    
    // Si solo hay inicio, marcar solo esa hora
    if (!this.endTime) {
      return h === start;
    }
    
    const end = parseInt(this.endTime);
    // Marcar desde inicio hasta fin (sin incluir fin)
    return h >= start && h < end;
  }

  // Seleccionar un slot de hora
  selectHourSlot(slot: { hour: string; occupied: boolean; past: boolean }) {
    // No permitir seleccionar horas ocupadas o pasadas
    if (slot.occupied || slot.past) return;

    const clickedHour = parseInt(slot.hour);

    // Si no hay hora de inicio, establecerla
    if (!this.startTime) {
      this.startTime = slot.hour;
      this.endTime = '';
      return;
    }

    // Si ya hay hora de inicio pero no de fin
    if (this.startTime && !this.endTime) {
      const start = parseInt(this.startTime);
      
      // Si hace clic en la misma hora o antes, reiniciar con esa hora como inicio
      if (clickedHour <= start) {
        this.startTime = slot.hour;
        this.endTime = '';
        return;
      }

      // Verificar que no haya horas ocupadas entre el inicio y el clic
      const occupied = Array.isArray(this.occupiedHours) ? this.occupiedHours : [];
      const hasOccupiedInBetween = occupied.some(occ => {
        const occupiedStart = parseInt(occ.start_hour);
        // Verificar si hay una reserva que comienza entre nuestro inicio y fin
        return occupiedStart >= start && occupiedStart < clickedHour;
      });

      if (hasOccupiedInBetween) {
        // No se puede seleccionar un rango que atraviese una reserva
        this.notificationService.error('No puedes reservar un rango que incluya horas ocupadas');
        return;
      }

      // Establecer hora de fin (la hora clickeada es donde termina la reserva)
      this.endTime = String(clickedHour).padStart(2, '0');
      return;
    }

    // Si ya hay ambas horas, reiniciar con nueva selección
    this.startTime = slot.hour;
    this.endTime = '';
  }

  // Limpiar selección de horario
  clearTimeSelection() {
    this.startTime = '';
    this.endTime = '';
  }

  getAvailableHours(): string[] {
    const hours: string[] = [];
    const today = new Date();
    const selectedDate = new Date(this.selectedDate);
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Si es hoy, empezar desde la hora actual
    const startHour = selectedDate.getTime() === today.getTime() ? new Date().getHours() : 0;

    for (let i = startHour; i < 24; i++) {
      const hourStr = String(i).padStart(2, '0');
      
      // Verificar si esta hora está ocupada
      const isOccupied = this.occupiedHours.some(occupied => {
        const occupiedStart = parseInt(occupied.start_hour);
        const occupiedEnd = parseInt(occupied.end_hour);
        // La hora está ocupada si cae dentro de un rango reservado
        return i >= occupiedStart && i < occupiedEnd;
      });
      
      if (!isOccupied) {
        hours.push(hourStr);
      }
    }

    return hours;
  }

  getEndHours(): string[] {
    if (!this.startTime) return [];

    const hours: string[] = [];
    const startHour = parseInt(this.startTime);

    // Encontrar la próxima hora ocupada después de la hora de inicio seleccionada
    let maxEndHour = 24;
    for (const occupied of this.occupiedHours) {
      const occupiedStart = parseInt(occupied.start_hour);
      // Si hay una reserva que empieza después de nuestra hora de inicio,
      // no podemos terminar después de que esa reserva empiece
      if (occupiedStart > startHour && occupiedStart < maxEndHour) {
        maxEndHour = occupiedStart;
      }
    }

    // Las horas finales empiezan desde una hora después de la inicial
    // y no pueden exceder la próxima hora ocupada
    for (let i = startHour + 1; i <= maxEndHour; i++) {
      hours.push(String(i).padStart(2, '0'));
    }

    return hours;
  }

  // PASO 4: Resumen y crear reserva
  createReservation() {
    // Si hay advertencia de capacidad y no se ha confirmado, mostrar alerta
    if (this.showCapacityWarning) {
      this.notificationService.warning('Por favor confirma que deseas continuar a pesar de exceder la capacidad.');
      return;
    }

    const startDateTime = new Date(`${this.selectedDate}T${this.startTime}:00`);
    const endDateTime = new Date(`${this.selectedDate}T${this.endTime}:00`);

    const reservationData: any = {
      id_resource: this.selectedResource.id,
      start_date: startDateTime.toISOString(),
      end_date: endDateTime.toISOString(),
    };

    // Agregar id_group si es reserva de grupo
    if (this.reservationType === 'group' && this.selectedGroup) {
      reservationData.id_group = this.selectedGroup.id;
    }

    this.reservaService.createReservation(reservationData)
      .then((response: any) => {
        this.notificationService.success('¡Reserva creada exitosamente!');
        this.router.navigate(['/dashboard/reservas']);
      })
      .catch((error: any) => {
        // Manejar error de horario ocupado
        const errorMessage = error?.error?.error || '';
        
        if (errorMessage.includes('ya está reservado') || errorMessage.includes('horario')) {
          this.notificationService.error('Este horario ya está ocupado. Por favor selecciona otro horario disponible.');
          this.step = 'datetime'; // Regresar al paso de selección de horario
        } else {
          this.notificationService.error('Error al crear la reserva. Por favor intenta de nuevo.');
        }
      });
  }

  // Navegación
  goBack() {
    if (this.step === 'resources') {
      this.selectedSite = null;
      this.selectedResource = null;
      this.step = 'search';
      this.searchTerm = '';
      this.searchedSites = [];
    } else if (this.step === 'datetime') {
      this.selectedResource = null;
      this.step = 'resources';
    } else if (this.step === 'summary') {
      this.selectedDate = '';
      this.startTime = '';
      this.endTime = '';
      this.step = 'datetime';
    }
  }

  getMonthYear() {
    return this.currentCalendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
}
