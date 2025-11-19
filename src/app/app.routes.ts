import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { DashboardHome } from './pages/dashboard/dashboard-home/dashboard-home';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'about', component:About},
    { path: 'dashboard', component:DashboardHome},
    { path: '***', redirectTo: ''}
];
