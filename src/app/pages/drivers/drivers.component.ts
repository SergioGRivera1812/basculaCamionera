import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChoferesService } from '../../services/choferes.service';
import { Chofer } from '../../models/database.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DriverDialogComponent } from './components/driver-dialog/driver-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Gestión de Choferes</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon> NUEVO CHOFER
        </button>
      </header>
      
      <div class="table-card">
        <div class="loading-overlay" *ngIf="isLoading">Cargando choferes...</div>

        <div [hidden]="isLoading">
          <table mat-table [dataSource]="drivers" class="mat-elevation-z0">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let element"> {{element.id}} </td>
            </ng-container>

            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef> Nombre Completo </th>
              <td mat-cell *matCellDef="let element"> {{element.nombre}} </td>
            </ng-container>

            <ng-container matColumnDef="telefono">
              <th mat-header-cell *matHeaderCellDef> Teléfono </th>
              <td mat-cell *matCellDef="let element"> {{element.telefono || 'N/A'}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Acciones </th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="primary" (click)="openDialog(element)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteChofer(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

  openDialog(chofer?: Chofer): void {
    const dialogRef = this.dialog.open(DriverDialogComponent, {
      width: '400px',
      data: chofer ? { ...chofer } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (chofer && chofer.id) {
          this.choferesService.updateChofer(chofer.id, result).subscribe({
            next: () => {
              this.snackBar.open('Chofer actualizado', 'OK', { duration: 2000 });
              this.fetchChoferes();
            },
            error: () => this.snackBar.open('Error al actualizar', 'Cerrar')
          });
        } else {
          this.choferesService.createChofer(result).subscribe({
            next: () => {
              this.snackBar.open('Chofer creado', 'OK', { duration: 2000 });
              this.fetchChoferes();
            },
            error: () => this.snackBar.open('Error al crear', 'Cerrar')
          });
        }
      }
    });
  }

  deleteChofer(chofer: Chofer): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar al chofer "${chofer.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && chofer.id) {
        this.choferesService.deleteChofer(chofer.id).subscribe({
          next: () => {
            this.snackBar.open('Chofer eliminado', 'OK', { duration: 2000 });
            this.fetchChoferes();
          },
          error: () => this.snackBar.open('Error al eliminar', 'Cerrar')
        });
      }
    });
  }
}
