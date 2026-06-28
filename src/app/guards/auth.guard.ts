import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RedirectService } from '../services/redirect.service';

/**
 * Protege las rutas privadas. Si no hay sesión, guarda la URL solicitada en
 * el RedirectService (en memoria, no en la URL) y redirige al login.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const redirect = inject(RedirectService);

  if (auth.isAuthenticated()) {
    return true;
  }

  redirect.set(state.url);
  return router.createUrlTree(['/login']);
};
