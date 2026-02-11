import { Routes } from '@angular/router';
import { Admin } from './pages/admin/admin';
import { Usuario } from './pages/usuario/usuario';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', component: Admin },
  { path: 'usuario', component: Usuario },
  { path: '**', redirectTo: '' }
];
