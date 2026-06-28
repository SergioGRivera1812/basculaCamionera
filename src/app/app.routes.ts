import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'scale', pathMatch: 'full' },
      {
        path: 'scale',
        loadComponent: () =>
          import('./pages/scale/scale.component').then((m) => m.ScaleComponent),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/clients/clients.component').then((m) => m.ClientsComponent),
      },
      {
        path: 'drivers',
        loadComponent: () =>
          import('./pages/drivers/drivers.component').then((m) => m.DriversComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
