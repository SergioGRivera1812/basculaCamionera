import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transaction-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="ticket-shell">
      <header class="ticket-top">
        <div class="top-left">
          <div class="ticket-icon">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div>
            <h2>Comprobante de Pesaje</h2>
            <span class="subtitle">Báscula Camionera Central · BASCU-SYS</span>
          </div>
        </div>
        <span class="folio-pill">#{{ data.codigoEntrada || data.folio || data.id }}</span>
      </header>

      <div class="ticket-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">FECHA / HORA</span>
            <span class="value mono">{{ (data.fecha || data.fecha_entrada || data.fecha_salida) | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="info-item">
            <span class="label">ESTADO OPERATIVO</span>
            <span class="status-tag" [class.completed]="data.estado === 'completado' || data.activo === 0">
              {{ (data.estado === 'completado' || data.activo === 0) ? 'COMPLETADO' : 'EN PLANTA · SIN SALIDA' }}
            </span>
          </div>
          <div class="info-item full">
            <span class="label">CLIENTE / PROVEEDOR</span>
            <span class="value strong">{{ data.cliente }}</span>
          </div>
          <div class="info-item">
            <span class="label">OPERADOR / CHOFER</span>
            <span class="value">{{ data.chofer || data.nombre_chofer }}</span>
          </div>
          <div class="info-item" *ngIf="data.placa">
            <span class="label">PLACA</span>
            <span class="value mono">{{ data.placa }}</span>
          </div>
        </div>

        <div class="weights-box">
          <div class="weight-row">
            <span class="w-label">TARA (ENTRADA)</span>
            <span class="w-val">{{ (data.tara || 0) | number:'1.0-0' }} <small>kg</small></span>
          </div>
          <div class="weight-row">
            <span class="w-label">PESO BRUTO (SALIDA)</span>
            <span class="w-val">{{ (data.bruto || 0) | number:'1.0-0' }} <small>kg</small></span>
          </div>
          <div class="weight-row net">
            <span class="w-label">PESO NETO OFICIAL</span>
            <span class="w-val">{{ (data.neto || 0) | number:'1.0-0' }} <small>kg</small></span>
          </div>
        </div>

        <div class="signature-box">
          <div class="sig-line"></div>
          <span>Firma y Sello del Operador en Turno</span>
        </div>
      </div>

      <footer class="ticket-footer">
        <button type="button" class="btn-close" (click)="onClose()">Cerrar</button>
        <button type="button" class="btn-print" (click)="onPrint()">
          <mat-icon>print</mat-icon>
          <span>Reimprimir Ticket</span>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .ticket-shell {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .ticket-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;

      .top-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ticket-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #0f172a;
        color: #60a5fa;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon { font-size: 20px; width: 20px; height: 20px; }
      }

      h2 { margin: 0; font-size: 1.02rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
      .subtitle { font-size: 0.74rem; color: #64748b; }

      .folio-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        font-weight: 700;
        color: #0f172a;
        background: #e2e8f0;
        padding: 4px 10px;
        border-radius: 6px;
      }
    }

    .ticket-body {
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
        &.full { grid-column: 1 / span 2; }

        .label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.06em;
        }
        .value {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 500;
          &.strong { font-weight: 700; color: #0f172a; font-size: 0.96rem; }
          &.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        }
      }
    }

    .status-tag {
      display: inline-flex;
      align-self: flex-start;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;

      &.completed {
        background: #ecfdf5;
        color: #065f46;
        border-color: #a7f3d0;
      }
    }

    .weights-box {
      background: #0f172a;
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .weight-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        color: #cbd5e1;

        .w-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }

        .w-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.05rem;
          font-weight: 700;
          color: #f8fafc;
          small { font-size: 0.78rem; color: #64748b; }
        }

        &.net {
          border-top: 1px solid #334155;
          padding-top: 10px;
          margin-top: 2px;

          .w-label { color: #e2e8f0; font-weight: 700; }
          .w-val {
            font-size: 1.45rem;
            color: #34d399;
            small { color: #34d399; font-size: 0.85rem; }
          }
        }
      }
    }

    .signature-box {
      text-align: center;
      padding-top: 18px;
      .sig-line {
        width: 200px;
        height: 1px;
        background: #cbd5e1;
        margin: 0 auto 6px;
      }
      span {
        font-size: 0.74rem;
        color: #64748b;
      }
    }

    .ticket-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 22px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .btn-close {
      height: 38px;
      padding: 0 16px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      &:hover { background: #f1f5f9; color: #0f172a; }
    }

    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 38px;
      padding: 0 18px;
      border-radius: 8px;
      background: #1e293b;
      border: 1px solid #0f172a;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: #60a5fa; }
      &:hover { background: #0f172a; }
    }
  `]
})
export class TransactionDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TransactionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onPrint(): void {
    console.log('Imprimiendo ticket...', this.data);
    this.dialogRef.close();
  }
}
