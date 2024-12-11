import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './pages/login-register/login-register.component';
import { CarListComponent } from './pages/car-list/car-list.component';
import { CarDetailComponent } from './pages/car-detail/car-detail.component';
import { CarFormComponent } from './pages/car-form/car-form.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { CarSearchComponent } from './pages/car-search/car-search.component';
import { MyCarsComponent } from './pages/my-cars/my-cars.component';
// import { AuthGuard, AdminGuard, OwnerGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginRegisterComponent },
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailComponent },
  { path: 'car-form', component: CarFormComponent /*, canActivate: [AuthGuard] */ },
  { path: 'car-form/:id', component: CarFormComponent /*, canActivate: [AuthGuard, OwnerGuard] */ },
  { path: 'admin', component: AdminPanelComponent /*, canActivate: [AdminGuard] */ },
  { path: 'search', component: CarSearchComponent },
  { path: 'my-cars', component: MyCarsComponent /*, canActivate: [AuthGuard] */ }
];