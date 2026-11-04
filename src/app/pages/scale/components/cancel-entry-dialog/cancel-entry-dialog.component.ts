import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface CancelEntryDialogData {
  id: number;
  folio: number;
  chofer: string;
  cliente: string;
  tara: number;
}

@Component({
  selector: 'app-cancel-entry-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div class="cancel-modal-shell">
      <header class="modal-header">
        <div class="header-left">
          <div class="warn-icon">
            <mat-icon>block</mat-icon>
          </div>
          <div>
            <h2>Anular / Cancelar Pesaje de Entrada</h2>
            <span class="subtitle">Liberación de folio activo en patio</span>
          </div>
        </div>
        <button type="button" class="close-btn" (click)="onDismiss()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="modal-body">
        <div class="summary-card">
          <div class="summary-row">
            <span class="s-label">FOLIO ACTIVO</span>
            <span class="s-folio">#{{ data.folio }}</span>
          </div>
          <div class="summary-row">
            <span class="s-label">CLIENTE / PROVEEDOR</span>
            <span class="s-val">{{ data.cliente }}</span>
          </div>
          <div class="summary-row">
            <span class="s-label">CHOFER</span>
            <span class="s-val">{{ data.chofer }}</span>
          </div>
          <div class="summary-row">
            <span class="s-label">TARA REGISTRADA</span>
            <span class="s-val mono">{{ data.tara | number:'1.0-0' }} kg</span>
          </div>
        </div>

        <p class="notice-text">
          Al anular esta entrada, el registro pasará a estado inactivo y el código de entrada
          <strong>#{{ data.folio }}</strong> quedará disponible nuevamente.
        </p>

        <form [formGroup]="form" class="reason-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Motivo de Cancelación (Obligatorio)</mat-label>
            <textarea
              matInput
              formControlName="motivo"
              rows="3"
              placeholder="Ej: Error en lectura de báscula, unidad se retiró sin cargar, cambio de unidad..."
            ></textarea>
            <mat-icon matPrefix>edit_note</mat-icon>
            <mat-error *ngIf="form.get('motivo')?.hasError('required')">
              Debe especificar el motivo de la anulación.
            </mat-error>
            <mat-error *ngIf="form.get('motivo')?.hasError('minlength')">
              Describa el motivo con al menos 5 caracteres.
            </mat-error>
          </mat-form-field>
        </form>
      </div>

      <footer class="modal-footer">
        <button type="button" class="btn-secondary" (click)="onDismiss()">Conservar Entrada</button>
        <button type="button" class="btn-danger" [disabled]="form.invalid" (click)="onConfirm()">
          <mat-icon>cancel</mat-icon>
          <span>ANULAR PESAJE</span>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .cancel-modal-shell {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      background: #fff1f2;
      border-bottom: 1px solid #fecdd3;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .warn-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #be123c;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon { font-size: 20px; width: 20px; height: 20px; }
      }

      h2 {
        margin: 0;
        font-size: 1.02rem;
        font-weight: 700;
        color: #881337;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 0.75rem;
        color: #9f1239;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: #9f1239;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover { background: rgba(190, 18, 60, 0.1); }
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .modal-body {
      padding: 20px 22px 10px;
    }

    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.84rem;
      }

      .s-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
      }

      .s-folio {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        color: #0f172a;
        background: #e2e8f0;
        padding: 2px 8px;
        border-radius: 5px;
      }

      .s-val {
        font-weight: 600;
        color: #1e293b;
        &.mono { font-family: 'JetBrains Mono', monospace; }
      }
    }

    .notice-text {
      margin: 0 0 14px;
      font-size: 0.83rem;
      color: #475569;
      line-height: 1.45;
    }

    .full-width { width: 100%; }

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

    .btn-danger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 18px;
      border-radius: 8px;
      background: #be123c;
      border: 1px solid #9f1239;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      cursor: pointer;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover:not(:disabled) { background: #9f1239; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `],
})
export class CancelEntryDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CancelEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelEntryDialogData
  ) {
    this.form = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onDismiss(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.motivo.trim());
    }
  }
}
