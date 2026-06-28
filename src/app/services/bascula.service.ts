import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaBascula, SalidaBascula, Transaccion } from '../models/database.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BasculaService {
  private readonly API_URL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getEntradasActivas(): Observable<EntradaBascula[]> {
    return this.http.get<EntradaBascula[]>(`${this.API_URL}/entrada/activos`);
  }

  registrarEntrada(entrada: EntradaBascula): Observable<EntradaBascula> {
    return this.http.post<EntradaBascula>(`${this.API_URL}/entrada`, entrada);
  }

  registrarSalida(salida: SalidaBascula): Observable<SalidaBascula> {
    return this.http.post<SalidaBascula>(`${this.API_URL}/salida`, salida);
  }

  getHistorialCompleto(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.API_URL}/transacciones`);
  }
}
