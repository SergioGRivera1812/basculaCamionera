import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/database.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Gestión de Usuarios</h1>
        <button mat-raised-button color="primary">
          <mat-icon>person_add</mat-icon> NUEVO USUARIO
        </button>
      </header>
      
      <div class="table-card">
        <div class="loading-overlay" *ngIf="isLoading">Cargando usuarios...</div>

        <table mat-table [dataSource]="users" class="mat-elevation-z0" *ngIf="!isLoading">
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *mat-header-cellDef> ID </th>
            <td mat-cell *mat-cellDef="let element"> {{element.id}} </td>
          </ng-container>

          <ng-container matColumnDef="usuario">
            <th mat-header-cell *mat-header-cellDef> Usuario </th>
            <td mat-cell *mat-cellDef="let element"> {{element.usuario}} </td>
          </ng-container>

          <ng-container matColumnDef="nombre">
            <th mat-header-cell *mat-header-cellDef> Nombre </th>
            <td mat-cell *mat-cellDef="let element"> {{element.nombre}} </td>
          </ng-container>

          <ng-container matColumnDef="rol">
            <th mat-header-cell *mat-header-cellDef> Rol </th>
            <td mat-cell *mat-cellDef="let element">
              <mat-chip-set>
                <mat-chip [color]="element.rol === 'admin' ? 'primary' : ''" selected>
                  {{element.rol | uppercase}}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *mat-header-cellDef> Acciones </th>
            <td mat-cell *mat-cellDef="let element">
              <button mat-icon-button color="accent"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteUsuario(element)"><mat-icon>delete</mat-icon></button>
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
  // Asegúrate de que este array coincida exactamente con las matColumnDef de arriba
  displayedColumns: string[] = ['id', 'usuario', 'nombre', 'rol', 'actions'];
  users: Usuario[] = [];
  isLoading = true;

  constructor(private usuariosService: UsuariosService, private snackBar: MatSnackBar) {}

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

  deleteUsuario(usuario: Usuario): void {
    if (usuario.id && confirm(`¿Eliminar?`)) {
      this.usuariosService.deleteUsuario(usuario.id).subscribe(() => {
        this.fetchUsuarios();
      });
    }
  }
}
