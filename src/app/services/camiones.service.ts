import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly API_URL = 'http://localhost:3000/api/camiones';

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
