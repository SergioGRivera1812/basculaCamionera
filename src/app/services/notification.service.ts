import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  NotificationComponent,
  NotificationType,
} from '../components/notification/notification.component';

/**
 * Centraliza las notificaciones flotantes de la app. Reemplaza el uso directo
 * de MatSnackBar para que todas compartan el mismo diseño (NotificationComponent).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, detail?: string): void {
    this.open('success', message, detail);
  }

  error(message: string, detail?: string): void {
    // Los errores duran un poco más para dar tiempo a leerlos.
    this.open('error', message, detail, 5000);
  }

  info(message: string, detail?: string): void {
    this.open('info', message, detail);
  }

  private open(
    type: NotificationType,
    message: string,
    detail?: string,
    duration = 3000,
  ): void {
    this.snackBar.openFromComponent(NotificationComponent, {
      data: { type, message, detail },
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'app-notification',
    });
  }
}
