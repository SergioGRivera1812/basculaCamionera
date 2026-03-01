import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  id?: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {
  private readonly API_URL = 'http://localhost:3000/api/materiales';

  constructor(private http: HttpClient) { }

  getMateriales(): Observable<Material[]> {
    return this.http.get<Material[]>(this.API_URL);
  }

  createMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(this.API_URL, material);
  }

  deleteMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
