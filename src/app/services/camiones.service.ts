import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Camion {
  id?: number;
  placas: string;
  chofer?: string;
  creado_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CamionesService {
  private readonly API_URL = `${environment.apiUrl}/camiones`;

  constructor(private http: HttpClient) { }

  getCamiones(): Observable<Camion[]> {
    return this.http.get<Camion[]>(this.API_URL);
  }

  getCamionByPlaca(placa: string): Observable<Camion> {
    return this.http.get<Camion>(`${this.API_URL}/${placa}`);
  }

  createCamion(camion: Camion): Observable<Camion> {
    return this.http.post<Camion>(this.API_URL, camion);
  }

  deleteCamion(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
