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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChoferesService } from '../../services/choferes.service';
import { Chofer } from '../../models/database.models';
import { DriverDialogComponent } from './components/driver-dialog/driver-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-drivers',
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
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriversComponent implements OnInit, AfterViewInit {
  private readonly choferesService = inject(ChoferesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'actions'];
  dataSource = new MatTableDataSource<Chofer>([]);
  isLoading = true;

  ngOnInit(): void {
    this.fetchChoferes();
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

  fetchChoferes(): void {
    this.isLoading = true;
    this.choferesService
      .getChoferes()
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
          this.snackBar.open('Error al cargar choferes', 'Cerrar', { duration: 3000 });
        },
      });
  }

  openDialog(chofer?: Chofer): void {
    const dialogRef = this.dialog.open(DriverDialogComponent, {
      width: '400px',
      data: chofer ? { ...chofer } : null,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        if (chofer?.id) {
          this.choferesService
            .updateChofer(chofer.id, result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Chofer actualizado', 'OK', { duration: 2000 });
                this.fetchChoferes();
              },
              error: () => this.snackBar.open('Error al actualizar', 'Cerrar'),
            });
        } else {
          this.choferesService
            .createChofer(result)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Chofer creado', 'OK', { duration: 2000 });
                this.fetchChoferes();
              },
              error: () => this.snackBar.open('Error al crear', 'Cerrar'),
            });
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
        color: 'warn',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && chofer.id) {
          this.choferesService
            .deleteChofer(chofer.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.snackBar.open('Chofer eliminado', 'OK', { duration: 2000 });
                this.fetchChoferes();
              },
              error: () => this.snackBar.open('Error al eliminar', 'Cerrar'),
            });
        }
      });
  }
}
