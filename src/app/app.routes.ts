import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Auth } from './features/auth/auth';
import { DashboardLayout } from './shared/layout/dashboard-layout/dashboard-layout';
import { DashHome } from './features/dashboard/dash-home/dash-home';
import { DashGroup } from './features/dashboard/groups/dash-group/dash-group';
import { DashSites } from './features/dashboard/sites/dash-sites/dash-sites';
import { DashReservas } from './features/dashboard/reservas/dash-reservas/dash-reservas';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth},
    { path: 'dashboard',
         component:DashboardLayout,
         children: [
            { path: 'home', component:DashHome },
            { path: 'reservas', component:DashReservas },
            { path: 'groups', component:DashGroup},
            { path: 'sites', component:DashSites}
    ]},
    { path: '***', redirectTo: ''}
];
