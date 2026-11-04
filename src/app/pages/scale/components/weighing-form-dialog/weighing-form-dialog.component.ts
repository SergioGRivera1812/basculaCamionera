import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ClientesService } from '../../../../services/clientes.service';
import { ChoferesService } from '../../../../services/choferes.service';
import { MaterialesService } from '../../../../services/materiales.service';
import { Cliente, Chofer, Material } from '../../../../models/database.models';

@Component({
  selector: 'app-weighing-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <header class="dialog-header">
        <div class="header-content">
          <div class="header-icon" [class.salida]="data.type === 'salida'">
            <mat-icon>{{ data.type === 'entrada' ? 'login' : 'logout' }}</mat-icon>
          </div>
          <div class="title-group">
            <h2>Captura de Pesaje</h2>
            <span class="subtitle">{{ data.type === 'entrada' ? 'Registro de Entrada (1er Pesaje)' : 'Cierre de Salida (2do Pesaje)' }}</span>
          </div>
        </div>
        <button type="button" class="close-btn" (click)="onCancel()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="dialog-body">
        <!-- Pantalla Digital de Lectura -->
        <div class="weight-readout">
          <div class="readout-main">
            <span class="readout-label">{{ data.type === 'salida' ? 'PESO BRUTO DETECTADO' : 'TARA DETECTADA' }}</span>
            <div class="readout-value">{{ data.weight | number:'1.0-0' }} <small>kg</small></div>
          </div>

          <div class="readout-breakdown" *ngIf="data.type === 'salida'">
            <div class="breakdown-item">
              <span>Tara Entrada</span>
              <strong>{{ (data.tare || 0) | number:'1.0-0' }} kg</strong>
            </div>
            <div class="breakdown-item net">
              <span>Peso Neto</span>
              <strong>{{ (data.weight - (data.tare || 0)) | number:'1.0-0' }} kg</strong>
            </div>
          </div>
        </div>

        <form [formGroup]="weighingForm" class="form-container">
          <div class="form-section">
            <h3 class="section-title"><mat-icon>local_shipping</mat-icon> Identificación de Unidad</h3>
            <div class="grid-row">
              <mat-form-field appearance="outline">
                <mat-label>Folio Manual (Opcional)</mat-label>
                <input matInput formControlName="codigoEntrada" type="number" placeholder="Autogenerado">
                <mat-icon matPrefix>tag</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Placa del Camión</mat-label>
                <input matInput formControlName="plate" placeholder="ABC-123" class="uppercase">
                <mat-icon matPrefix>badge</mat-icon>
                <mat-error *ngIf="weighingForm.get('plate')?.invalid">La placa es obligatoria</mat-error>
              </mat-form-field>
            </div>
            <div class="single-row">
              <mat-form-field appearance="outline">
                <mat-label>Operador / Chofer</mat-label>
                <mat-select formControlName="driver">
                  <mat-option *ngFor="let c of choferes" [value]="c.nombre">{{ c.nombre }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="weighingForm.get('driver')?.invalid">Seleccione un chofer</mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="form-section">
            <h3 class="section-title"><mat-icon>business</mat-icon> Datos Comerciales y Carga</h3>
            <div class="grid-row">
              <mat-form-field appearance="outline">
                <mat-label>Cliente / Proveedor</mat-label>
                <mat-select formControlName="cliente">
                  <mat-option *ngFor="let c of clientes" [value]="c.nombre">{{ c.nombre }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>apartment</mat-icon>
                <mat-error *ngIf="weighingForm.get('cliente')?.invalid">Seleccione un cliente</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Material / Producto</mat-label>
                <mat-select formControlName="product_id">
                  <mat-option *ngFor="let m of materiales" [value]="m.id">{{ m.nombre }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>inventory_2</mat-icon>
                <mat-error *ngIf="weighingForm.get('product_id')?.invalid">Seleccione el material</mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observaciones Operativas</mat-label>
            <textarea matInput formControlName="notes" placeholder="Notas adicionales del pesaje..." rows="2"></textarea>
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <footer class="dialog-footer">
        <button type="button" class="btn-cancel" (click)="onCancel()">Cancelar</button>
        <button type="button" class="btn-save" [disabled]="weighingForm.invalid" (click)="onSave()">
          <mat-icon>print</mat-icon>
          <span>GUARDAR E IMPRIMIR</span>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .dialog-header {
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;

      .header-content {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .header-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #0f172a;
        color: #60a5fa;
        display: flex;
        align-items: center;
        justify-content: center;
        &.salida { color: #34d399; }
        mat-icon { font-size: 21px; width: 21px; height: 21px; }
      }

      .title-group {
        h2 { margin: 0; font-size: 1.08rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
        .subtitle { font-size: 0.78rem; color: #64748b; }
      }

      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover { background: #e2e8f0; color: #0f172a; }
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .dialog-body {
      padding: 20px 24px 12px;
      max-height: 75vh;
      overflow-y: auto;
    }

    .weight-readout {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      .readout-main {
        .readout-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .readout-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.1rem;
          font-weight: 800;
          color: #34d399;
          line-height: 1.1;
          margin-top: 2px;
          small { font-size: 1rem; color: #64748b; font-weight: 600; }
        }
      }

      .readout-breakdown {
        display: flex;
        gap: 18px;
        text-align: right;
        border-left: 1px solid #334155;
        padding-left: 18px;

        .breakdown-item {
          display: flex;
          flex-direction: column;
          span { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
          strong { font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: #e2e8f0; margin-top: 2px; }
          &.net strong { color: #ffffff; font-size: 1.15rem; }
        }
      }
    }

    .form-section { padding: 6px 0; }
    .section-divider { height: 1px; background: #f1f5f9; margin: 4px 0 10px; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 0 0 12px;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: #64748b; }
    }
    .grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .single-row { width: 100%; }
    .full-width { width: 100%; margin-top: 4px; }
    .uppercase { text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
    mat-form-field { width: 100%; }

    .dialog-footer {
      padding: 14px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-cancel {
      height: 40px;
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

    .btn-save {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      background: #1e293b;
      border: 1px solid #0f172a;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      cursor: pointer;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #60a5fa; }
      &:hover:not(:disabled) { background: #0f172a; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class WeighingFormDialogComponent implements OnInit {
  weighingForm: FormGroup;
  clientes: Cliente[] = [];
  choferes: Chofer[] = [];
  materiales: Material[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WeighingFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clientesSrv: ClientesService,
    private choferesSrv: ChoferesService,
    private materialesSrv: MaterialesService
  ) {
    this.weighingForm = this.fb.group({
      codigoEntrada: [data.codigoEntrada || ''],
      plate: [data.plate || '', [Validators.required]],
      driver: [data.driver || '', Validators.required],
      cliente: [data.cliente || '', Validators.required],
      product_id: [data.product_id || '', Validators.required],
      notes: [data.notes || '']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.clientesSrv.getClientes().subscribe(res => this.clientes = res);
    this.choferesSrv.getChoferes().subscribe(res => this.choferes = res);
    this.materialesSrv.getMateriales().subscribe(res => this.materiales = res);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.weighingForm.valid) {
      this.dialogRef.close({
        ...this.weighingForm.value,
        type: this.data.type,
        weight: this.data.weight,
        tare: this.data.tare
      });
    }
  }
}
