import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/database.models';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit, AfterViewInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'usuario', 'nombre', 'rol', 'actions'];
  dataSource = new MatTableDataSource<Usuario>([]);
  isLoading = true;

  ngOnInit(): void {
    this.fetchUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  fetchUsuarios(): void {
    this.isLoading = true;
    this.usuariosService
      .getUsuarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dataSource.data = Array.isArray(data) ? data : data ? [data] : [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 2000 });
        },
      });
  }

  openDialog(usuario?: Usuario): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: usuario ? { ...usuario } : null,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        if (usuario?.id) {
          this.usuariosService
            .updateUsuario(usuario.id, result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Usuario actualizado', 'OK', { duration: 2000 });
                this.fetchUsuarios();
              },
              error: () => this.snackBar.open('Error al actualizar', 'Cerrar'),
            });
        } else {
          this.usuariosService
            .createUsuario(result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Usuario creado', 'OK', { duration: 2000 });
                this.fetchUsuarios();
              },
              error: () => this.snackBar.open('Error al crear', 'Cerrar'),
            });
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
        color: 'warn',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && usuario.id) {
          this.usuariosService
            .deleteUsuario(usuario.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Usuario eliminado', 'OK', { duration: 2000 });
                this.fetchUsuarios();
              },
              error: () => this.snackBar.open('Error al eliminar', 'Cerrar'),
            });
        }
      });
  }
}
