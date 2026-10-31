import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './authService';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = await auth.esperarUsuario();

  return usuario ? true : router.createUrlTree(['/login']);
};
