import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { DashboardHome } from './features/dashboard/dashboard-home/dashboard-home';
import { Auth } from './features/auth/auth';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth},
    { path: 'dashboard', component:DashboardHome},
    { path: '***', redirectTo: ''}
];
