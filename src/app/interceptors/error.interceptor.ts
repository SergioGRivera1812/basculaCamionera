import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Manejo centralizado de errores HTTP:
 * - 401: la sesión expiró o es inválida -> cerramos sesión.
 * - Resto: notificamos al usuario con un mensaje legible.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        snackBar.open('Tu sesión expiró. Inicia sesión nuevamente.', 'Cerrar', {
          duration: 4000,
        });
      } else if (error.status === 0) {
        snackBar.open('No se pudo conectar con el servidor.', 'Cerrar', {
          duration: 4000,
        });
      }
      return throwError(() => error);
    }),
  );
};
