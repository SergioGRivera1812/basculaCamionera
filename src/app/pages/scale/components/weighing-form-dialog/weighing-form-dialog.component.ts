import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-wrapper">
      <header class="dialog-header">
        <div class="header-content">
          <mat-icon [color]="data.type === 'entrada' ? 'primary' : 'warn'">
            {{ data.type === 'entrada' ? 'login' : 'logout' }}
          </mat-icon>
          <div class="title-group">
            <h2 mat-dialog-title>Captura de Pesaje</h2>
            <span class="subtitle">{{ data.type === 'entrada' ? 'Registro de Entrada' : 'Registro de Salida' }}</span>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()"><mat-icon>close</mat-icon></button>
      </header>

      <mat-dialog-content class="dialog-body">
        <div class="weight-card" [class.salida]="data.type === 'salida'">
          <div class="main-weight">
            <span class="label">PESO ACTUAL</span>
            <div class="value">{{ data.weight | number }} <small>kg</small></div>
          </div>
          <div class="weight-details" *ngIf="data.type === 'salida'">
            <div class="detail-item">
              <span>Tara</span>
              <strong>{{ data.tare | number }} kg</strong>
            </div>
            <div class="detail-item net-highlight">
              <span>Neto</span>
              <strong>{{ (data.weight - data.tare) | number }} kg</strong>
            </div>
          </div>
        </div>

        <form [formGroup]="weighingForm" class="form-container">
          <div class="form-section">
            <h3 class="section-title"><mat-icon>local_shipping</mat-icon> Información del Vehículo</h3>
            <div class="grid-row">
              <mat-form-field appearance="outline">
                <mat-label>Folio Manual (Opcional)</mat-label>
                <input matInput formControlName="codigoEntrada" type="number" placeholder="Ej: 54321">
                <mat-icon matPrefix>tag</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Placa</mat-label>
                <input matInput formControlName="plate" placeholder="ABC-123" class="uppercase">
                <mat-icon matPrefix>badge</mat-icon>
                <mat-error *ngIf="weighingForm.get('plate')?.invalid">La placa es requerida</mat-error>
              </mat-form-field>
            </div>
            <div class="grid-row">
              <mat-form-field appearance="outline">
                <mat-label>Chofer</mat-label>
                <mat-select formControlName="driver">
                  <mat-option *ngFor="let c of choferes" [value]="c.nombre">{{ c.nombre }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="weighingForm.get('driver')?.invalid">Seleccione un chofer</mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="form-section">
            <h3 class="section-title"><mat-icon>business</mat-icon> Datos Comerciales</h3>
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
                <mat-label>Material</mat-label>
                <mat-select formControlName="product_id">
                  <mat-option *ngFor="let m of materiales" [value]="m.id">{{ m.nombre }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>inventory_2</mat-icon>
                <mat-error *ngIf="weighingForm.get('product_id')?.invalid">Seleccione el material</mat-error>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observaciones</mat-label>
            <textarea matInput formControlName="notes" placeholder="Notas adicionales del pesaje..." rows="2"></textarea>
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-footer">
        <button mat-button (click)="onCancel()" class="btn-cancel">CANCELAR</button>
        <button mat-raised-button color="primary" class="btn-save"
                [disabled]="weighingForm.invalid" 
                (click)="onSave()">
          <mat-icon>print</mat-icon> GUARDAR E IMPRIMIR
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper { overflow: hidden; border-radius: 12px; }
    .dialog-header { 
      padding: 16px 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background: #fdfdfd; 
      border-bottom: 1px solid #eee;
      .header-content { display: flex; align-items: center; gap: 16px; }
      .title-group { 
        h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1e293b; }
        .subtitle { font-size: 0.875rem; color: #64748b; }
      }
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .dialog-body { padding: 24px !important; }
    .weight-card { 
      background: #eff6ff; 
      border-radius: 12px; 
      padding: 20px; 
      margin-bottom: 24px; 
      display: flex; 
      align-items: center;
      justify-content: space-between;
      border: 1px solid #dbeafe;
      &.salida { background: #fff1f2; border-color: #ffe4e6; .main-weight .value { color: #e11d48; } }
      .main-weight { 
        .label { font-size: 0.75rem; font-weight: 600; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 2.5rem; font-weight: 800; color: #1d4ed8; line-height: 1; margin-top: 4px; small { font-size: 1.25rem; } }
      }
      .weight-details { 
        display: flex; gap: 24px; text-align: right;
        .detail-item { 
          display: flex; flex-direction: column; 
          span { font-size: 0.75rem; color: #64748b; }
          strong { font-size: 1.1rem; color: #1e293b; }
        }
        .net-highlight strong { color: #10b981; }
      }
    }
    .form-section { padding: 16px 0; }
    .section-title { 
      display: flex; align-items: center; gap: 8px; 
      font-size: 0.9rem; font-weight: 600; color: #64748b; 
      margin-bottom: 16px; 
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; margin-top: 16px; }
    .uppercase { text-transform: uppercase; }
    .dialog-footer { padding: 16px 24px; border-top: 1px solid #eee; gap: 12px; }
    .btn-save { padding: 0 24px; height: 44px; font-weight: 600; }
    mat-form-field { width: 100%; }
    ::ng-deep .mat-mdc-dialog-container { padding: 0 !important; }
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
