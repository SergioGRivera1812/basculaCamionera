import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Restringe rutas solo a usuarios con rol 'admin'. Si no lo es, lo manda a la
 * báscula. OJO: esto es solo una compuerta de UI; la autorización real por rol
 * todavía NO está aplicada en el backend (ver doc de la API).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAdmin() ? true : router.createUrlTree(['/scale']);
};
