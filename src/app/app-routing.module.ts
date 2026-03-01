import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ScaleComponent } from './pages/scale/scale.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { DriversComponent } from './pages/drivers/drivers.component';
import { UsersComponent } from './pages/users/users.component';
import { ReportsComponent } from './pages/reports/reports.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'scale', component: ScaleComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'users', component: UsersComponent },
      { path: 'reports', component: ReportsComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
