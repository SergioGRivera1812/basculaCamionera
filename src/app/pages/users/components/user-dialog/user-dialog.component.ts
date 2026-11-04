import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Usuario } from '../../../../models/database.models';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="modal-shell">
      <header class="modal-header">
        <div class="header-left">
          <div class="modal-icon">
            <mat-icon>manage_accounts</mat-icon>
          </div>
          <div>
            <h2>{{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
            <span class="subtitle">Control de credenciales y nivel de acceso</span>
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
            <input matInput formControlName="nombre" placeholder="Nombre del operador o administrador">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nombre de Usuario (Login)</mat-label>
            <input matInput formControlName="usuario" placeholder="Ej: j.perez">
            <mat-icon matPrefix>alternate_email</mat-icon>
            <mat-error *ngIf="form.get('usuario')?.hasError('required')">El usuario es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="!data">
            <mat-label>Contraseña Inicial</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres">
            <mat-icon matPrefix>lock_outline</mat-icon>
            <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Debe tener al menos 6 caracteres</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rol en el Sistema</mat-label>
            <mat-select formControlName="rol">
              <mat-option value="operador">Operador de Báscula</mat-option>
              <mat-option value="admin">Administrador del Sistema</mat-option>
            </mat-select>
            <mat-icon matPrefix>verified_user</mat-icon>
            <mat-error *ngIf="form.get('rol')?.hasError('required')">Seleccione un rol</mat-error>
          </mat-form-field>
        </form>
      </div>

      <footer class="modal-footer">
        <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
        <button type="button" class="btn-primary" [disabled]="form.invalid" (click)="onSave()">
          <mat-icon>check</mat-icon>
          <span>{{ data ? 'Guardar Cambios' : 'Crear Cuenta' }}</span>
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
export class UserDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null
  ) {
    this.form = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      usuario: [data?.usuario || '', Validators.required],
      password: ['', data ? [] : [Validators.required, Validators.minLength(6)]],
      rol: [data?.rol || 'operador', Validators.required]
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
