import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
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
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Usuario</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre Completo</mat-label>
          <input matInput formControlName="nombre" placeholder="Nombre completo">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">El nombre es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre de Usuario</mat-label>
          <input matInput formControlName="usuario" placeholder="Username">
          <mat-error *ngIf="form.get('usuario')?.hasError('required')">El usuario es requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="!data">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres">
          <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es requerida</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol">
            <mat-option value="admin">Administrador</mat-option>
            <mat-option value="operador">Operador</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('rol')?.hasError('required')">El rol es requerido</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        {{ data ? 'Actualizar' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 10px;
      min-width: 350px;
    }
    mat-form-field { width: 100%; }
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
