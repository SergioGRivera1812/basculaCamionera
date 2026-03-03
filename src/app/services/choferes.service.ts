import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chofer } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class ChoferesService {
  private readonly API_URL = 'http://localhost:3000/api/choferes';

  constructor(private http: HttpClient) { }

  getChoferes(): Observable<Chofer[]> {
    return this.http.get<Chofer[]>(this.API_URL);
  }

  createChofer(chofer: Chofer): Observable<Chofer> {
    return this.http.post<Chofer>(this.API_URL, chofer);
  }

  updateChofer(id: number, chofer: Chofer): Observable<Chofer> {
    return this.http.put<Chofer>(`${this.API_URL}/${id}`, chofer);
  }

  deleteChofer(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
