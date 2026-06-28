import { Usuario } from './database.models';

export interface LoginRequest {
  usuario: string;
  password: string;
}

/**
 * Respuesta de POST /api/usuarios/login.
 * Incluye el JWT (HS256, expira en 8h) que debe enviarse como
 * `Authorization: Bearer <token>` en el resto de la API.
 */
export interface LoginResponse {
  message: string;
  token: string;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'rol'>;
}

export type AuthUser = LoginResponse['usuario'];
