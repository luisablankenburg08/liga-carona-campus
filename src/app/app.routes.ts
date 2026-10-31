import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then( m => m.CadastroPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'menu',
    canActivate: [authGuard],
    loadComponent: () => import('./menu/menu.page').then( m => m.MenuPage)
  },
  {
    path: 'minhas-caronas',
    canActivate: [authGuard],
    loadComponent: () => import('./minhas-caronas/minhas-caronas.page').then( m => m.MinhasCaronasPage)
  },
  {
    path: 'caronas-anteriores',
    canActivate: [authGuard],
    loadComponent: () => import('./caronas-anteriores/caronas-anteriores.page').then((m) => m.CaronasAnterioresPage)
  },

];
