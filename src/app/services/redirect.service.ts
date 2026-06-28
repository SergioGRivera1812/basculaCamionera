import { Injectable } from '@angular/core';

/**
 * Guarda en memoria la ruta a la que el usuario quería entrar antes de que
 * el authGuard lo enviara al login. Así no exponemos `returnUrl` en la URL.
 *
 * Nota: al ser en memoria, un refresco completo de la página pierde el destino
 * y se cae al default (/scale). Es un trade-off aceptable a cambio de una URL limpia.
 */
@Injectable({ providedIn: 'root' })
export class RedirectService {
  private url: string | null = null;

  /** El authGuard registra aquí la ruta solicitada. */
  set(url: string): void {
    // No tiene sentido recordar el propio login como destino.
    this.url = url.startsWith('/login') ? null : url;
  }

  /** Devuelve el destino guardado y lo limpia (uso único). */
  consume(): string | null {
    const target = this.url;
    this.url = null;
    return target;
  }
}
