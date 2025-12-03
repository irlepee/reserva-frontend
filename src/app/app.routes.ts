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
import { EditGroups } from './features/dashboard/groups/edit-groups/edit-groups';
import { CreateSites } from './features/dashboard/sites/create-sites/create-sites';
import { EditSites } from './features/dashboard/sites/edit-sites/edit-sites';
import { ManageResources } from './features/dashboard/sites/manage-resources/manage-resources';
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
                    { path: 'create', component:CreateGroups},
                    { path: 'edit/:id', component:EditGroups},
                    { path: 'view-group/:id', component:DashGroup }
                ]
            },
            { path: 'sites', component:Sites,
                children: [
                    { path: '', component:DashSites },
                    { path: 'create', component:CreateSites},
                    { path: 'edit/:id', component:EditSites},
                    { path: 'manage-resources/:id', component:ManageResources}
                ]
            }
    ]},
    { path: '***', redirectTo: ''}
];
