import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { DashboardHome } from './pages/dashboard/dashboard-home/dashboard-home';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth },
    { path: 'about', component:About},
    { path: 'dashboard', component:DashboardHome},
    { path: '***', redirectTo: ''}
];
