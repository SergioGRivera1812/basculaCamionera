import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'bascula.token';
const USER_KEY = 'bascula.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  // El backend expone el login bajo /usuarios/login (no /auth/login).
  private readonly LOGIN_URL = `${environment.apiUrl}/usuarios/login`;

  // Estado reactivo con signals (Angular 18).
  private readonly _currentUser = signal<AuthUser | null>(this.restoreSession());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  /** Rol del usuario logueado, útil para mostrar/ocultar opciones de UI. */
  readonly rol = computed(() => this._currentUser()?.rol ?? null);
  readonly isAdmin = computed(() => this._currentUser()?.rol === 'admin');

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.LOGIN_URL, credentials)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Token Bearer para el authInterceptor. */
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._currentUser.set(res.usuario);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  /**
   * Reconstruye la sesión al iniciar la app. Solo la considera válida si hay
   * token Y usuario Y el token no está expirado; en caso contrario, limpia todo
   * para no arrancar en un estado inconsistente.
   */
  private restoreSession(): AuthUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);

    if (!token || !rawUser || this.isTokenExpired(token)) {
      this.clearStorage();
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  /** Decodifica el payload del JWT y comprueba `exp` (segundos epoch). */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.exp) {
        return false;
      }
      return payload.exp * 1000 <= Date.now();
    } catch {
      // Token mal formado -> lo tratamos como inválido.
      return true;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
