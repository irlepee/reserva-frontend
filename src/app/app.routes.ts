import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Auth } from './features/auth/auth';
import { DashboardLayout } from './shared/layout/dashboard-layout/dashboard-layout';
import { DashHome } from './features/dashboard/dash-home/dash-home';
import { Groups } from './features/dashboard/groups/groups';
import { DashGroup } from './features/dashboard/groups/dash-group/dash-group';
import { Reservas } from './features/dashboard/reservas/reservas';
import { DashReservas } from './features/dashboard/reservas/dash-reservas/dash-reservas';
import { Sites } from './features/dashboard/sites/sites';
import { DashSites } from './features/dashboard/sites/dash-sites/dash-sites';
import { CreateGroups } from './features/dashboard/groups/create-groups/create-groups';
import { CreateSites } from './features/dashboard/sites/create-sites/create-sites';
import { HistoryReservas } from './features/dashboard/reservas/history-reservas/history-reservas';

export const routes: Routes = [
    { path: '', component:Home },
    { path: 'login', component:Auth},
    { path: 'dashboard',
         component:DashboardLayout,
         children: [
            { path: 'home', component:DashHome },
            { path: 'reservas', component:Reservas,
                children: [
                    { path: '', component:DashReservas },
                    { path: 'history', component:HistoryReservas}
                ]
             },
            { path: 'groups', component:Groups,
                children: [
                    { path: '', component:DashGroup },
                    { path: 'create', component:CreateGroups}
                ]
            },
            { path: 'sites', component:Sites,
                children: [
                    { path: '', component:DashSites },
                    { path: 'create', component:CreateSites}
                ]
            }
    ]},
    { path: '***', redirectTo: ''}
];
