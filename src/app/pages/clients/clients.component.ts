import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/database.models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule
  ],
 template: `
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">Gestión de Clientes</h1>
        <button mat-raised-button color="primary">NUEVO CLIENTE</button>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div *ngIf="isLoading" style="padding: 40px; text-align: center;">
          Cargando datos...
        </div>
        
        <table mat-table [dataSource]="dataSource" style="width: 100%;" *ngIf="!isLoading">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *mat-cellDef="let row"> {{row.id}} </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *mat-cellDef="let row"> {{row.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="contacto">
            <th mat-header-cell *mat-header-cellDef> Contacto </th>
            <td mat-cell *mat-cellDef="let row"> {{row.contacto}} </td>
          </ng-container>

          <ng-container matColumnDef="telefono">
            <th mat-header-cell *mat-header-cellDef> Teléfono </th>
            <td mat-cell *mat-cellDef="let row"> {{row.telefono}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *mat-header-cellDef> Acciones </th>
            <td mat-cell *mat-cellDef="let row">
              <button mat-icon-button color="warn" (click)="delete(row)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedCols"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedCols;"></tr>
        </table>

        <div *ngIf="!isLoading && dataSource.data.length === 0" style="padding: 40px; text-align: center; color: #999;">
          No hay registros para mostrar.
        </div>
      </div>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  // Las columnas deben ser exactamente iguales a los matColumnDef del HTML
  displayedCols: string[] = ['id', 'nombre', 'contacto', 'telefono', 'actions'];
  dataSource = new MatTableDataSource<Cliente>([]);
  isLoading = true;

  constructor(
    private srv: ClientesService, 
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.isLoading = true;
    this.srv.getClientes().subscribe({
      next: (res) => {
        this.dataSource.data = Array.isArray(res) ? res : (res ? [res] : []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snack.open('Error al conectar con la API', 'Cerrar', { duration: 2000 });
      }
    });
  }

  delete(c: Cliente): void {
    if (c.id && confirm('¿Desea eliminar este registro?')) {
      this.srv.deleteCliente(c.id).subscribe(() => this.fetch());
    }
  }
}
