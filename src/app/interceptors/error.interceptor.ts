import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Manejo centralizado de errores HTTP:
 * - 401 en endpoints protegidos: la sesión expiró o es inválida -> cerramos sesión.
 * - Error de red (status 0): avisamos al usuario.
 *
 * El login (POST /usuarios/login) se EXCLUYE: ahí un 401 significa "contraseña
 * incorrecta" y lo maneja el propio LoginComponent, no es una sesión expirada.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notify = inject(NotificationService);
  const isLoginRequest = req.url.includes('/usuarios/login');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        auth.logout();
        notify.error('Tu sesión expiró', 'Inicia sesión nuevamente.');
      } else if (error.status === 0) {
        notify.error('No se pudo conectar con el servidor');
      }
      return throwError(() => error);
    }),
  );
};
