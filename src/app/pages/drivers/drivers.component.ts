import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChoferesService } from '../../services/choferes.service';
import { Chofer } from '../../models/database.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Gestión de Choferes</h1>
        <button mat-raised-button color="primary">
          <mat-icon>person_add</mat-icon> NUEVO CHOFER
        </button>
      </header>
      
      <div class="table-card">
        <div class="loading-overlay" *ngIf="isLoading">Cargando choferes...</div>

        <div [hidden]="isLoading">
          <table mat-table [dataSource]="drivers" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *mat-header-cellDef> ID </th>
              <td mat-cell *mat-cellDef="let element"> {{element.id}} </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *mat-header-cellDef> Nombre Completo </th>
              <td mat-cell *mat-cellDef="let element"> {{element.nombre}} </td>
            </ng-container>

            <ng-container matColumnDef="telefono">
              <th mat-header-cell *mat-header-cellDef> Teléfono </th>
              <td mat-cell *mat-cellDef="let element"> {{element.telefono || 'N/A'}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *mat-header-cellDef> Acciones </th>
              <td mat-cell *mat-cellDef="let element">
                <button mat-icon-button color="accent"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteChofer(element)"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *mat-header-rowDef="displayedColumns"></tr>
            <tr mat-row *mat-rowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="no-data" *ngIf="drivers.length === 0">
            No se encontraron choferes registrados.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 30px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; h1 { margin: 0; color: #2c3e50; } }
    .table-card { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 20px; min-height: 200px; position: relative; }
    table { width: 100%; }
    .loading-overlay { text-align: center; padding: 40px; color: #7f8c8d; font-style: italic; }
    .no-data { text-align: center; padding: 40px; color: #95a5a6; }
  `]
})
export class DriversComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'actions'];
  drivers: Chofer[] = [];
  isLoading = true;

  constructor(
    private choferesService: ChoferesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchChoferes();
  }

  fetchChoferes(): void {
    this.isLoading = true;
    this.choferesService.getChoferes().subscribe({
      next: (data) => {
        this.drivers = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar choferes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteChofer(chofer: Chofer): void {
    if (confirm(`¿Eliminar al chofer ${chofer.nombre}?`)) {
      this.choferesService.deleteChofer(chofer.id!).subscribe(() => {
        this.snackBar.open('Chofer eliminado', 'OK');
        this.fetchChoferes();
      });
    }
  }
}
