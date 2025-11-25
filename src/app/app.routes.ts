import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Auth } from './features/auth/auth';
import { DashboardLayout } from './shared/layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth},
    { path: 'dashboard', component:DashboardLayout},
    { path: '***', redirectTo: ''}
];
