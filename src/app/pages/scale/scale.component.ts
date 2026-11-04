import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WeighingFormDialogComponent } from './components/weighing-form-dialog/weighing-form-dialog.component';
import { TransactionDetailsDialogComponent } from './components/transaction-details-dialog/transaction-details-dialog.component';
import { CancelEntryDialogComponent } from './components/cancel-entry-dialog/cancel-entry-dialog.component';
import { BasculaService } from '../../services/bascula.service';
import { MaterialesService } from '../../services/materiales.service';
import { NotificationService } from '../../services/notification.service';
import {
  EntradaBascula,
  CrearEntrada,
  CrearSalida,
  Transaccion,
  Material,
  TipoOperacion,
} from '../../models/database.models';

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
    MatTooltipModule,
  ],
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);
  readonly basculaService = inject(BasculaService);
  private readonly materialesService = inject(MaterialesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // Signals expuestos desde BasculaService (Hardware / Web Serial / WS / Simulación)
  readonly pesoHardware = this.basculaService.pesoActual;
  readonly lecturaEstable = this.basculaService.estable;
  readonly modoConexion = this.basculaService.modoConexion;
  readonly etiquetaModo = this.basculaService.etiquetaModo;
  readonly ticketActual = this.basculaService.ticketActual;

  currentWeight = 0;
  tare = 0;
  net = 0;
  gross = 0;
  unit = 'kg';

  // Historial y catálogos auxiliares
  recentTransactions: Transaccion[] = [];
  entradasActivas: EntradaBascula[] = [];
  materialesMap = new Map<number, string>();
  foliosCancelados = new Set<number>();
  dataSource = new MatTableDataSource<Transaccion>([]);

  displayedColumns: string[] = [
    'codigoEntrada',
    'tipo_operacion',
    'cliente',
    'nombre_chofer',
    'tara',
    'bruto',
    'neto',
    'fecha',
    'estado',
    'acciones',
  ];

  get enPlantaCount(): number {
    return this.recentTransactions.filter((t) => t.estado === 'pendiente').length;
  }

  constructor() {
    // Sincronizar lectura en vivo desde el servicio de hardware/simulación
    effect(() => {
      const liveWeight = this.pesoHardware();
      this.currentWeight = liveWeight;
      this.gross = liveWeight;
      if (this.tare > 0) {
        this.net = Math.abs(this.gross - this.tare);
      }
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  esPendiente(t: Transaccion): boolean {
    return t?.estado === 'pendiente';
  }

  esCancelado(t: Transaccion): boolean {
    return t?.estado === 'cancelado';
  }

  cargarDatos(): void {
    forkJoin({
      activas: this.basculaService.getEntradasActivas().pipe(catchError(() => of(null))),
      transacciones: this.basculaService.getHistorialCompleto().pipe(catchError(() => of([] as Transaccion[]))),
      materiales: this.materialesService.getMateriales().pipe(catchError(() => of([] as Material[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ activas, transacciones, materiales }) => {
        const listaActivasObtuvoRespuesta = Array.isArray(activas);
        this.entradasActivas = listaActivasObtuvoRespuesta ? activas : [];

        this.materialesMap.clear();
        for (const m of materiales || []) {
          if (m.id != null) {
            this.materialesMap.set(m.id, m.nombre);
          }
        }

        // Mapa de entradas activas (activo = 1 en BD) por codigoEntrada
        const activasPorFolio = new Map<number, EntradaBascula>();
        for (const ea of this.entradasActivas) {
          activasPorFolio.set(Number(ea.codigoEntrada), ea);
        }

        const foliosVistos = new Set<number>();

        const enriched: Transaccion[] = (Array.isArray(transacciones) ? transacciones : []).map((t: any) => {
          const folioNum = Number(t.codigoEntrada ?? t.folio ?? t.id ?? 0);
          foliosVistos.add(folioNum);
          const matchActiva = activasPorFolio.get(folioNum);
          const idMat = t.id_material ?? matchActiva?.id_material;
          const rawTipo = String(t.tipo_operacion || matchActiva?.tipo_operacion || 'DESPACHO').toUpperCase();
          const tipoOp: TipoOperacion = rawTipo === 'RECEPCION' ? 'RECEPCION' : 'DESPACHO';

          const rawEstado = String(t.estado || '').trim().toLowerCase();
          const tieneSalida =
            Number(t.bruto) > 0 ||
            rawEstado === 'completado' ||
            rawEstado === 'finalizado';

          // Solo puede estar cancelado si NO tiene peso bruto de salida
          const fueCanceladoSinSalida =
            !tieneSalida &&
            (rawEstado === 'cancelado' ||
              rawEstado === 'anulado' ||
              t.activo === 0 ||
              !!t.motivo_cancelacion ||
              this.foliosCancelados.has(folioNum) ||
              (listaActivasObtuvoRespuesta && !activasPorFolio.has(folioNum)));

          let estadoNorm: 'completado' | 'pendiente' | 'cancelado';
          if (tieneSalida) {
            estadoNorm = 'completado';
          } else if (fueCanceladoSinSalida) {
            estadoNorm = 'cancelado';
          } else {
            estadoNorm = 'pendiente';
          }

          return {
            ...t,
            // Priorizar el id de entrada_bascula para el endpoint POST /api/entrada/:id/cancelar
            id: matchActiva?.id ?? t.id_entrada ?? t.id,
            folio: folioNum,
            codigoEntrada: folioNum,
            cliente: t.cliente || matchActiva?.cliente || 'CLIENTE MOSTRADOR',
            chofer: t.chofer || t.nombre_chofer || matchActiva?.nombre_chofer || '',
            nombre_chofer: t.nombre_chofer || t.chofer || matchActiva?.nombre_chofer || '',
            id_material: idMat,
            material:
              t.material ||
              matchActiva?.material ||
              (idMat ? this.materialesMap.get(idMat) : undefined) ||
              'General',
            tipo_operacion: tipoOp,
            fecha: t.fecha || t.fecha_entrada || matchActiva?.fecha_entrada,
            fecha_entrada: t.fecha_entrada || t.fecha || matchActiva?.fecha_entrada,
            estado: estadoNorm,
          } as Transaccion;
        });

        // Incluir entradas activas de /entrada/activos/lista que aún no estén en /transacciones
        for (const ea of this.entradasActivas) {
          const folioNum = Number(ea.codigoEntrada);
          if (!foliosVistos.has(folioNum) && !this.foliosCancelados.has(folioNum)) {
            const rawTipo = String(ea.tipo_operacion || 'DESPACHO').toUpperCase();
            enriched.unshift({
              id: ea.id,
              folio: folioNum,
              codigoEntrada: folioNum,
              cliente: ea.cliente || 'CLIENTE MOSTRADOR',
              chofer: ea.nombre_chofer || '',
              nombre_chofer: ea.nombre_chofer || '',
              placa: ea.placa,
              id_material: ea.id_material,
              material:
                ea.material ||
                (ea.id_material ? this.materialesMap.get(ea.id_material) : undefined) ||
                'General',
              tipo_operacion: rawTipo === 'RECEPCION' ? 'RECEPCION' : 'DESPACHO',
              tara: Number(ea.tara) || 0,
              bruto: 0,
              neto: 0,
              fecha: ea.fecha_entrada,
              fecha_entrada: ea.fecha_entrada,
              estado: 'pendiente',
            });
          }
        }

        this.recentTransactions = enriched;
        this.dataSource.data = enriched;

        this.dataSource.filterPredicate = (row: Transaccion, filter: string) => {
          const searchStr =
            `${row.folio} ${row.tipo_operacion || ''} ${row.cliente} ${row.chofer} ${row.placa || ''} ${row.material || ''} ${row.estado}`.toLowerCase();
          return searchStr.includes(filter);
        };

        this.cdr.markForCheck();
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async onConectarSerial(): Promise<void> {
    try {
      await this.basculaService.conectarPuertoSerial();
      this.notify.success('Indicador conectado', 'Lectura activa por puerto serial RS-232');
    } catch (err: any) {
      this.notify.info(
        'Modo Simulación Activo',
        err?.message || 'No se seleccionó puerto serial físico.'
      );
    }
  }

  onSimularPeso(peso: number): void {
    this.basculaService.fijarPesoSimulado(peso);
  }

  onTarar(): void {
    this.tare = this.currentWeight;
    this.net = Math.abs(this.gross - this.tare);
    this.notify.success('Peso tarado correctamente', `${this.tare.toLocaleString()} kg`);
  }

  onCero(): void {
    this.basculaService.fijarPesoSimulado(0);
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
      width: '540px',
      data: {
        weight: this.currentWeight,
        type: isSalida ? 'salida' : 'entrada',
        tare: this.tare,
        tipo_operacion: 'DESPACHO',
        entradasActivas: this.entradasActivas,
      },
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
      width: '540px',
      data: {
        weight: this.currentWeight,
        type: 'salida',
        tare: transaction.tara,
        plate: transaction.placa || 'S/P',
        driver: transaction.chofer || transaction.nombre_chofer,
        cliente: transaction.cliente,
        product_id: transaction.id_material,
        material: transaction.material,
        tipo_operacion: transaction.tipo_operacion || 'DESPACHO',
        codigoEntrada: transaction.codigoEntrada || transaction.folio,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.guardarSalida(result, transaction);
        }
      });
  }

  onAnularEntrada(transaction: Transaccion): void {
    const folio = Number(transaction.codigoEntrada || transaction.folio);
    const matchActiva = this.entradasActivas.find((e) => Number(e.codigoEntrada) === folio);
    // Priorizar siempre el id primario de entrada_bascula
    const entryId = matchActiva?.id ?? transaction.id ?? transaction.id_entrada ?? folio;

    const dialogRef = this.dialog.open(CancelEntryDialogComponent, {
      width: '460px',
      data: {
        id: entryId,
        folio,
        chofer: transaction.chofer || transaction.nombre_chofer || 'Operador',
        cliente: transaction.cliente,
        tara: transaction.tara,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((motivo: string | null) => {
        if (!motivo) return;

        this.basculaService
          .cancelarEntrada(entryId, motivo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.foliosCancelados.add(folio);
              transaction.estado = 'cancelado';
              transaction.motivo_cancelacion = motivo;
              this.notify.success(
                'Pesaje de entrada anulado',
                `Folio #${folio} marcado como CANCELADO`
              );
              this.cargarDatos();
            },
            error: (err) => {
              this.notify.error(
                'No se pudo anular la entrada',
                err.error?.error || err.error?.message || err.message
              );
            },
          });
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

    const tipoOperacion: TipoOperacion = data.tipo_operacion || 'DESPACHO';
    const codigo = Number(data.codigoEntrada) || Math.floor(100000 + Math.random() * 900000);

    // Si este folio había sido cancelado antes y se reutiliza, quitarlo del set local de cancelados
    this.foliosCancelados.delete(codigo);

    const nuevaEntrada: CrearEntrada = {
      codigoEntrada: codigo,
      nombre_chofer: data.driver,
      id_material: data.product_id,
      cliente: data.cliente || 'CLIENTE MOSTRADOR',
      tara,
      tipo_operacion: tipoOperacion,
      placa: data.plate,
      observaciones: data.notes,
    };

    this.basculaService
      .registrarEntrada(nuevaEntrada)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success(
            `Ticket de Entrada (${tipoOperacion}) guardado`,
            `Folio #${nuevaEntrada.codigoEntrada}`
          );

          this.basculaService.imprimirTicketTermico({
            folio: nuevaEntrada.codigoEntrada,
            tipo_operacion: tipoOperacion,
            fecha_entrada: new Date().toISOString(),
            chofer: nuevaEntrada.nombre_chofer,
            placa: data.plate,
            cliente: nuevaEntrada.cliente,
            material: data.materialNombre || `Material #${nuevaEntrada.id_material}`,
            tara: nuevaEntrada.tara,
            estado: 'EN PLANTA · PENDIENTE SALIDA',
            observaciones: data.notes,
          });

          this.basculaService.fijarPesoSimulado(42850);
          this.tare = 0;
          this.net = 0;
          this.cargarDatos();
        },
        error: (err) =>
          this.notify.error('Error al registrar la entrada', err.error?.error || err.message),
      });
  }

  private guardarSalida(data: any, originalTx?: Transaccion): void {
    const codigo = Number(
      data.codigoEntrada ||
        originalTx?.codigoEntrada ||
        originalTx?.folio ||
        (this.entradasActivas.length > 0 ? this.entradasActivas[0].codigoEntrada : null)
    );

    if (!Number.isFinite(codigo) || codigo <= 0) {
      this.notify.error('No se encontró una entrada previa para este ticket');
      return;
    }

    const bruto = Number(data.weight);

    if (!Number.isFinite(bruto)) {
      this.notify.error('Peso inválido', 'El peso de la salida no es válido.');
      return;
    }

    const tipoOperacion: TipoOperacion =
      data.tipo_operacion || originalTx?.tipo_operacion || 'DESPACHO';
    const tara = Number(data.tare ?? originalTx?.tara ?? 0);
    const netoLocal = tipoOperacion === 'RECEPCION' ? tara - bruto : bruto - tara;

    const nuevaSalida: CrearSalida = {
      codigoEntrada: codigo,
      bruto,
      tipo_operacion: tipoOperacion,
    };

    this.basculaService
      .registrarSalida(nuevaSalida)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const netoFinal = res?.neto != null ? res.neto : netoLocal;
          const detalle = `Folio #${codigo} · Neto ${netoFinal.toLocaleString()} kg`;
          this.notify.success('Ticket de Salida completado', detalle);

          this.basculaService.imprimirTicketTermico({
            folio: codigo,
            tipo_operacion: tipoOperacion,
            fecha_entrada: originalTx?.fecha_entrada || originalTx?.fecha,
            fecha_salida: new Date().toISOString(),
            chofer: data.driver || originalTx?.chofer || '',
            placa: data.plate || originalTx?.placa,
            cliente: data.cliente || originalTx?.cliente || '',
            material: data.materialNombre || originalTx?.material || 'General',
            tara,
            bruto,
            neto: netoFinal,
            estado: 'COMPLETADO',
            observaciones: data.notes,
          });

          this.basculaService.fijarPesoSimulado(24520);
          this.tare = 0;
          this.net = 0;
          this.cargarDatos();
        },
        error: (err) =>
          this.notify.error('Error al completar la salida', err.error?.error || err.message),
      });
  }

  viewTransaction(t: Transaccion): void {
    this.dialog.open(TransactionDetailsDialogComponent, {
      width: '460px',
      data: t,
    });
  }

  printTransaction(t: Transaccion): void {
    const folio = Number(t.codigoEntrada || t.folio);
    this.notify.info('Imprimiendo ticket térmico 80mm', `Folio #${folio}`);
    this.basculaService.imprimirTicketTermico({
      folio,
      tipo_operacion: t.tipo_operacion || 'DESPACHO',
      fecha_entrada: t.fecha_entrada || t.fecha,
      fecha_salida: t.fecha_salida,
      chofer: t.chofer || t.nombre_chofer || '',
      placa: t.placa,
      cliente: t.cliente,
      material: t.material || `Material #${t.id_material || 1}`,
      tara: Number(t.tara) || 0,
      bruto: Number(t.bruto) || 0,
      neto: Number(t.neto) || 0,
      estado:
        t.estado === 'cancelado'
          ? 'CANCELADO / ANULADO'
          : t.estado === 'completado'
          ? 'COMPLETADO'
          : 'EN PLANTA · SIN SALIDA',
    });
  }
}
