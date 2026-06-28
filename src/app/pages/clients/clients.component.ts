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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsComponent implements OnInit, AfterViewInit {
  private readonly srv = inject(ClientesService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedCols: string[] = ['id', 'nombre', 'contacto', 'telefono', 'actions'];
  dataSource = new MatTableDataSource<Cliente>([]);
  isLoading = true;

  ngOnInit(): void {
    this.fetch();
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

  fetch(): void {
    this.isLoading = true;
    this.srv
      .getClientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dataSource.data = Array.isArray(res) ? res : res ? [res] : [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.snack.open('Error al conectar con la API', 'Cerrar', { duration: 2000 });
        },
      });
  }

  openDialog(cliente?: Cliente): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '400px',
      data: cliente ? { ...cliente } : null,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        if (cliente?.id) {
          this.srv
            .updateCliente(cliente.id, result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snack.open('Cliente actualizado', 'OK', { duration: 2000 });
                this.fetch();
              },
              error: () => this.snack.open('Error al actualizar', 'Cerrar'),
            });
        } else {
          this.srv
            .createCliente(result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snack.open('Cliente creado', 'OK', { duration: 2000 });
                this.fetch();
              },
              error: () => this.snack.open('Error al crear', 'Cerrar'),
            });
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
        color: 'warn',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && c.id) {
          this.srv
            .deleteCliente(c.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snack.open('Cliente eliminado', 'OK', { duration: 2000 });
                this.fetch();
              },
              error: () => this.snack.open('Error al eliminar', 'Cerrar'),
            });
        }
      });
  }
}
