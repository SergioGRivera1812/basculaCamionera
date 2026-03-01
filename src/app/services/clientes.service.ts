import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly API_URL = 'http://localhost:3000/api/proveedores'; 

  constructor(private http: HttpClient) { }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.API_URL);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.API_URL, cliente);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
