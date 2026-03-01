import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-transaction-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">Detalle de Transacción #{{ data.codigoEntrada || data.id }}</h2>
    
    <mat-dialog-content class="dialog-content">
      <div class="ticket-header">
        <h3>BÁSCULA CAMIONERA CENTRAL</h3>
        <p>Comprobante de Pesaje</p>
      </div>

      <mat-divider></mat-divider>

      <div class="ticket-body">
        <div class="info-row">
          <span class="label">Fecha:</span>
          <span class="value">{{ data.fecha_entrada || data.fecha_salida }}</span>
        </div>
        <div class="info-row">
          <span class="label">Chofer:</span>
          <span class="value strong">{{ data.nombre_chofer }}</span>
        </div>
        <div class="info-row">
          <span class="label">Cliente:</span>
          <span class="value">{{ data.cliente }}</span>
        </div>
        
        <mat-divider class="my-10"></mat-divider>
        
        <div class="weight-row" *ngIf="data.bruto">
          <span class="label">PESO BRUTO:</span>
          <span class="value">{{ data.bruto | number }} kg</span>
        </div>
        <div class="weight-row">
          <span class="label">TARA:</span>
          <span class="value">{{ (data.tara || 0) | number }} kg</span>
        </div>
        <div class="weight-row net" *ngIf="data.neto">
          <span class="label">PESO NETO:</span>
          <span class="value">{{ data.neto | number }} kg</span>
        </div>
      </div>

      <div class="ticket-footer">
        <p>Estado: <strong>{{ data.activo === 1 ? 'DENTRO' : 'COMPLETADO' }}</strong></p>
        <p class="signature-line">___________________________</p>
        <p>Firma del Operador</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">CERRAR</button>
      <button mat-raised-button color="primary" (click)="onPrint()">
        REIMPRIMIR TICKET
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { text-align: center; color: #2c3e50; }
    .ticket-header { text-align: center; margin-bottom: 15px; h3 { margin: 0; } p { margin: 0; font-size: 0.9rem; color: #7f8c8d; } }
    .ticket-body { padding: 15px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .weight-row { 
      display: flex; justify-content: space-between; padding: 5px 0; 
      &.net { font-size: 1.4rem; font-weight: bold; color: #2ecc71; margin-top: 5px; }
    }
    .label { color: #7f8c8d; }
    .value { font-weight: 500; &.strong { font-weight: bold; color: #2c3e50; } }
    .ticket-footer { text-align: center; margin-top: 30px; font-size: 0.9rem; }
    .signature-line { margin-top: 40px; margin-bottom: 5px; }
    .my-10 { margin: 10px 0; }
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
  }
}
