import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <span *ngIf="data.type === 'entrada'">Captura de Entrada</span>
      <span *ngIf="data.type === 'salida'">Completar Salida</span>
    </h2>
    
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="weighingForm" class="form-grid">
        <div class="weight-summary">
          <div class="summary-item">
            <label>Peso Bruto</label>
            <div class="value">{{ data.weight | number }} kg</div>
          </div>
          <div class="summary-item" *ngIf="data.type === 'salida'">
            <label>Tara (Entrada)</label>
            <div class="value">{{ data.tare | number }} kg</div>
          </div>
          <div class="summary-item highlighted" *ngIf="data.type === 'salida'">
            <label>Peso Neto</label>
            <div class="value">{{ (data.weight - data.tare) | number }} kg</div>
          </div>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Placa del Vehículo</mat-label>
          <input matInput formControlName="plate" placeholder="ABC-123" uppercase>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Producto / Material</mat-label>
          <mat-select formControlName="product">
            <mat-option value="Maíz Amarillo">Maíz Amarillo</mat-option>
            <mat-option value="Soya">Soya</mat-option>
            <mat-option value="Trigo">Trigo</mat-option>
            <mat-option value="Otros">Otros</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Chofer / Conductor</mat-label>
          <input matInput formControlName="driver" placeholder="Nombre completo">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">CANCELAR</button>
      <button mat-raised-button color="primary" 
              [disabled]="weighingForm.invalid" 
              (click)="onSave()">
        GUARDAR E IMPRIMIR
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { color: #2c3e50; font-weight: bold; border-bottom: 2px solid #3498db; margin-bottom: 20px; padding-bottom: 10px; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 10px; min-width: 400px; padding-top: 10px; }
    .weight-summary { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px; 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
      gap: 15px;
      border: 1px solid #eee;
    }
    .summary-item { 
      text-align: center; 
      label { display: block; font-size: 0.8rem; color: #7f8c8d; margin-bottom: 5px; }
      .value { font-size: 1.2rem; font-weight: bold; color: #2c3e50; }
      &.highlighted .value { color: #2ecc71; font-size: 1.4rem; }
    }
    .dialog-actions { padding: 20px; gap: 10px; }
    mat-form-field { width: 100%; }
  `]
})
export class WeighingFormDialogComponent {
  weighingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WeighingFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.weighingForm = this.fb.group({
      plate: [data.plate || '', [Validators.required, Validators.minLength(4)]],
      product: [data.product || '', Validators.required],
      driver: [data.driver || '', Validators.required],
      notes: [data.notes || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.weighingForm.valid) {
      this.dialogRef.close({
        ...this.weighingForm.value,
        weight: this.data.weight,
        timestamp: new Date().toISOString()
      });
    }
  }
}
