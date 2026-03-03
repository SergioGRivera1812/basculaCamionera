import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/database.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Gestión de Usuarios</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon> NUEVO USUARIO
        </button>
      </header>
      
      <div class="table-card">
        <div class="loading-overlay" *ngIf="isLoading">Cargando usuarios...</div>

        <table mat-table [dataSource]="users" class="mat-elevation-z0" *ngIf="!isLoading">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef> ID </th>
            <td mat-cell *matCellDef="let element"> {{element.id}} </td>
          </ng-container>

          <ng-container matColumnDef="usuario">
            <th mat-header-cell *matHeaderCellDef> Usuario </th>
            <td mat-cell *matCellDef="let element"> {{element.usuario}} </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element"> {{element.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="rol">
            <th mat-header-cell *matHeaderCellDef> Rol </th>
            <td mat-cell *matCellDef="let element">
              <mat-chip-set>
                <mat-chip [color]="element.rol === 'admin' ? 'primary' : ''" selected>
                  {{element.rol | uppercase}}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button color="primary" (click)="openDialog(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUsuario(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 30px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .table-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    table { width: 100%; }
    .loading-overlay { padding: 40px; text-align: center; color: #666; }
  `]
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'usuario', 'nombre', 'rol', 'actions'];
  users: Usuario[] = [];
  isLoading = true;

  constructor(
    private usuariosService: UsuariosService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchUsuarios();
  }

  fetchUsuarios(): void {
    this.isLoading = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [data];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar usuarios', 'Cerrar');
      }
    });
  }

  openDialog(usuario?: Usuario): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: usuario ? { ...usuario } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (usuario && usuario.id) {
          this.usuariosService.updateUsuario(usuario.id, result).subscribe({
            next: () => {
              this.snackBar.open('Usuario actualizado', 'OK', { duration: 2000 });
              this.fetchUsuarios();
            },
            error: () => this.snackBar.open('Error al actualizar', 'Cerrar')
          });
        } else {
          this.usuariosService.createUsuario(result).subscribe({
            next: () => {
              this.snackBar.open('Usuario creado', 'OK', { duration: 2000 });
              this.fetchUsuarios();
            },
            error: () => this.snackBar.open('Error al crear', 'Cerrar')
          });
        }
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.usuario}"?`,
        confirmText: 'Eliminar',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && usuario.id) {
        this.usuariosService.deleteUsuario(usuario.id).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado', 'OK', { duration: 2000 });
            this.fetchUsuarios();
          },
          error: () => this.snackBar.open('Error al eliminar', 'Cerrar')
        });
      }
    });
  }
}
