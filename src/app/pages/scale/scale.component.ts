import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WeighingFormDialogComponent } from './components/weighing-form-dialog/weighing-form-dialog.component';
import { TransactionDetailsDialogComponent } from './components/transaction-details-dialog/transaction-details-dialog.component';
import { BasculaService } from '../../services/bascula.service';
import { NotificationService } from '../../services/notification.service';
import { EntradaBascula, CrearEntrada, CrearSalida, Transaccion } from '../../models/database.models';

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  private readonly basculaService = inject(BasculaService);
  private readonly destroyRef = inject(DestroyRef);

  currentWeight = 0;
  tare = 0;
  net = 0;
  gross = 0;
  unit = 'kg';

  // Historial de la tabla
  recentTransactions: Transaccion[] = [];
  entradasActivas: EntradaBascula[] = [];
  dataSource = new MatTableDataSource<Transaccion>([]);

  constructor() {
    // Simulación de peso en tiempo real
    this.currentWeight = 24503;
    this.gross = 12540;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.basculaService
      .getEntradasActivas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => (this.entradasActivas = data));

    this.basculaService
      .getHistorialCompleto()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.recentTransactions = data;
        this.dataSource.data = data;

        // Personalizar el filtro para que busque en todos los campos visibles
        this.dataSource.filterPredicate = (row: Transaccion, filter: string) => {
          const searchStr =
            `${row.folio} ${row.cliente} ${row.chofer} ${row.placa || ''}`.toLowerCase();
          return searchStr.includes(filter);
        };
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onTarar(): void {
    this.tare = this.currentWeight;
    this.net = Math.abs(this.gross - this.tare);
    this.notify.success('Peso tarado correctamente', `${this.tare.toLocaleString()} kg`);
  }

  onCero(): void {
    this.currentWeight = 0;
    this.gross = 0;
    this.tare = 0;
    this.net = 0;
    this.notify.info('Báscula puesta a cero');
  }

  onImprimir(): void {
    if (this.currentWeight <= 0) {
      this.notify.info('No hay peso detectado en la báscula');
      return;
    }

    const isSalida = this.tare > 0;
    
    const dialogRef = this.dialog.open(WeighingFormDialogComponent, {
      width: '500px',
      data: { 
        weight: this.currentWeight, 
        type: isSalida ? 'salida' : 'entrada',
        tare: this.tare,
        entradasActivas: this.entradasActivas 
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          if (isSalida) {
            this.guardarSalida(result);
          } else {
            this.guardarEntrada(result);
          }
        }
      });
  }

  onFinalizarSalida(transaction: Transaccion): void {
    if (this.currentWeight <= 0) {
      this.notify.error('Debe haber un camión en la báscula para registrar la salida');
      return;
    }

    const dialogRef = this.dialog.open(WeighingFormDialogComponent, {
      width: '500px',
      data: { 
        weight: this.currentWeight, 
        type: 'salida',
        tare: transaction.tara,
        plate: transaction.placa,
        driver: transaction.chofer,
        cliente: transaction.cliente,
        product_id: transaction.id_material,
        codigoEntrada: transaction.codigoEntrada || transaction.folio
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.guardarSalida(result);
        }
      });
  }

  onCancelar(): void {
    this.onCero();
    this.notify.info('Operación cancelada y báscula reseteada');
  }

  private guardarEntrada(data: any): void {
    const tara = Number(data.weight);

    if (!Number.isFinite(tara)) {
      this.notify.error('Peso inválido', 'No se pudo registrar la tara de la entrada.');
      return;
    }

    const nuevaEntrada: CrearEntrada = {
      codigoEntrada: Number(data.codigoEntrada) || Math.floor(100000 + Math.random() * 900000),
      nombre_chofer: data.driver,
      id_material: data.product_id,
      cliente: data.cliente || 'CLIENTE MOSTRADOR',
      tara,
    };

    this.basculaService
      .registrarEntrada(nuevaEntrada)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success('Ticket de Entrada guardado', `Folio #${nuevaEntrada.codigoEntrada}`);
          this.onCero();
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al registrar la entrada', err.error?.error || err.message),
      });
  }

  private guardarSalida(data: any): void {
    const codigo = Number(
      data.codigoEntrada || (this.entradasActivas.length > 0 ? this.entradasActivas[0].codigoEntrada : null),
    );

    if (!Number.isFinite(codigo) || codigo <= 0) {
      this.notify.error('No se encontró una entrada previa para este ticket');
      return;
    }

    const bruto = Number(data.weight);

    // Validación que el backend NO hace: bruto debe ser numérico.
    if (!Number.isFinite(bruto)) {
      this.notify.error('Peso inválido', 'El peso bruto de la salida no es válido.');
      return;
    }

    // El backend calcula el neto (bruto - tara de la entrada) y cierra la entrada.
    // Por contrato, solo se envían codigoEntrada y bruto.
    const nuevaSalida: CrearSalida = { codigoEntrada: codigo, bruto };

    this.basculaService
      .registrarSalida(nuevaSalida)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const detalle =
            res?.neto != null ? `Folio #${codigo} · Neto ${res.neto.toLocaleString()} kg` : `Folio #${codigo}`;
          this.notify.success('Ticket de Salida completado', detalle);
          this.onCero();
          this.cargarDatos();
        },
        error: (err) => this.notify.error('Error al completar la salida', err.error?.error || err.message),
      });
  }

  viewTransaction(t: Transaccion): void {
    this.dialog.open(TransactionDetailsDialogComponent, {
      width: '450px',
      data: t,
    });
  }

  printTransaction(t: Transaccion): void {
    this.notify.info('Reimprimiendo ticket', `Folio #${t.codigoEntrada || t.folio}`);
  }
}
