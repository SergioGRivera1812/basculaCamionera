import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/database.models';
import { ClientDialogComponent } from './components/client-dialog/client-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clients',
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
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">Gestión de Clientes</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">NUEVO CLIENTE</button>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div *ngIf="isLoading" style="padding: 40px; text-align: center;">
          Cargando datos...
        </div>
        
        <table mat-table [dataSource]="dataSource" style="width: 100%;" *ngIf="!isLoading">

          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let row"> {{row.id}} </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let row"> {{row.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="contacto">
            <th mat-header-cell *matHeaderCellDef> Contacto </th>
            <td mat-cell *matCellDef="let row"> {{row.contacto}} </td>
          </ng-container>

          <ng-container matColumnDef="telefono">
            <th mat-header-cell *matHeaderCellDef> Teléfono </th>
            <td mat-cell *matCellDef="let row"> {{row.telefono}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="openDialog(row)">
                <mat-icon>edit</mat-icon>
              </button>
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
  displayedCols: string[] = ['id', 'nombre', 'contacto', 'telefono', 'actions'];
  dataSource = new MatTableDataSource<Cliente>([]);
  isLoading = true;

  constructor(
    private srv: ClientesService, 
    private snack: MatSnackBar,
    private dialog: MatDialog
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

  openDialog(cliente?: Cliente): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '400px',
      data: cliente ? { ...cliente } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (cliente && cliente.id) {
          this.srv.updateCliente(cliente.id, result).subscribe({
            next: () => {
              this.snack.open('Cliente actualizado', 'OK', { duration: 2000 });
              this.fetch();
            },
            error: () => this.snack.open('Error al actualizar', 'Cerrar')
          });
        } else {
          this.srv.createCliente(result).subscribe({
            next: () => {
              this.snack.open('Cliente creado', 'OK', { duration: 2000 });
              this.fetch();
            },
            error: () => this.snack.open('Error al crear', 'Cerrar')
          });
        }
      }
    });
  }

  delete(c: Cliente): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Cliente',
        message: `¿Estás seguro de que deseas eliminar al cliente "${c.nombre}"?`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && c.id) {
        this.srv.deleteCliente(c.id).subscribe({
          next: () => {
            this.snack.open('Cliente eliminado', 'OK', { duration: 2000 });
            this.fetch();
          },
          error: () => this.snack.open('Error al eliminar', 'Cerrar')
        });
      }
    });
  }
}
