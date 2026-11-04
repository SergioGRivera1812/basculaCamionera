import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Chofer } from '../../../../models/database.models';

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="modal-shell">
      <header class="modal-header">
        <div class="header-left">
          <div class="modal-icon">
            <mat-icon>local_shipping</mat-icon>
          </div>
          <div>
            <h2>{{ data ? 'Editar Chofer' : 'Nuevo Chofer' }}</h2>
            <span class="subtitle">Padrón de operadores de transporte</span>
          </div>
        </div>
        <button type="button" class="close-btn" (click)="onCancel()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="modal-body">
        <form [formGroup]="form" class="modal-form">
          <mat-form-field appearance="outline">
            <mat-label>Nombre Completo</mat-label>
            <input matInput formControlName="nombre" placeholder="Nombre y apellidos del operador">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre del chofer es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono de Contacto</mat-label>
            <input matInput formControlName="telefono" placeholder="Ej: 662 987 6543">
            <mat-icon matPrefix>call</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <footer class="modal-footer">
        <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
        <button type="button" class="btn-primary" [disabled]="form.invalid" (click)="onSave()">
          <mat-icon>check</mat-icon>
          <span>{{ data ? 'Guardar Cambios' : 'Registrar Chofer' }}</span>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .modal-shell {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .modal-icon {
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

      h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 0.76rem;
        color: #64748b;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid transparent;
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
    .modal-body {
      padding: 22px 22px 10px;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 340px;
      mat-form-field { width: 100%; }
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 22px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .btn-secondary {
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
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
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
      &:hover:not(:disabled) { background: #0f172a; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class DriverDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DriverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Chofer | null
  ) {
    this.form = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      telefono: [data?.telefono || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
