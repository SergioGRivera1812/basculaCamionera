import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EntradaBascula,
  CrearEntrada,
  CrearSalida,
  SalidaResponse,
  Transaccion,
} from '../models/database.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BasculaService {
  private readonly API_URL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getEntradasActivas(): Observable<EntradaBascula[]> {
    // /entrada/activos devuelve TODAS (nombre engañoso del backend);
    // /entrada/activos/lista devuelve solo las activas (activo = 1).
    return this.http.get<EntradaBascula[]>(`${this.API_URL}/entrada/activos/lista`);
  }

  registrarEntrada(entrada: CrearEntrada): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/entrada`, entrada);
  }

  registrarSalida(salida: CrearSalida): Observable<SalidaResponse> {
    return this.http.post<SalidaResponse>(`${this.API_URL}/salida`, salida);
  }

  getHistorialCompleto(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.API_URL}/transacciones`);
  }
}
