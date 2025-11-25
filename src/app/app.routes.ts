import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Auth } from './features/auth/auth';
import { DashboardLayout } from './shared/layout/dashboard-layout/dashboard-layout';
import { Reservas } from './features/dashboard/reservas/reservas';
import { Groups } from './features/dashboard/groups/groups';
import { Sites } from './features/dashboard/sites/sites';
import { DashHome } from './features/dashboard/dash-home/dash-home';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth},
    { path: 'dashboard',
         component:DashboardLayout,
         children: [
            { path: 'home', component:DashHome },
            { path: 'reservas', component:Reservas },
            { path: 'groups', component:Groups },
            { path: 'sites', component:Sites }
    ]},
    { path: '***', redirectTo: ''}
];
