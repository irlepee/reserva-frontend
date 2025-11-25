import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Home } from '../../../features/dashboard/home/home';
import { Reservas } from '../../../features/dashboard/reservas/reservas';
import { Groups } from '../../../features/dashboard/groups/groups';
import { Sites } from '../../../features/dashboard/sites/sites';

@Component({
  selector: 'app-dashboard-layout',
  imports: [Sidebar, Home, Reservas, Groups, Sites],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {

}
