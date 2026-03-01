import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaBascula, SalidaBascula } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class BasculaService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getEntradasActivas(): Observable<EntradaBascula[]> {
    return this.http.get<EntradaBascula[]>(`${this.API_URL}/entrada/activas`);
  }

  registrarEntrada(entrada: EntradaBascula): Observable<EntradaBascula> {
    return this.http.post<EntradaBascula>(`${this.API_URL}/entrada`, entrada);
  }

  registrarSalida(salida: SalidaBascula): Observable<SalidaBascula> {
    return this.http.post<SalidaBascula>(`${this.API_URL}/salida`, salida);
  }

  getHistorialCompleto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/entrada/historial`);
  }
}
