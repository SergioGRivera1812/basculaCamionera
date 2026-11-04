import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="confirm-shell">
      <div class="confirm-body">
        <div class="warn-badge">
          <mat-icon>warning_amber</mat-icon>
        </div>
        <div class="confirm-content">
          <h2>{{ data.title }}</h2>
          <p>{{ data.message }}</p>
        </div>
      </div>

      <footer class="confirm-footer">
        <button type="button" class="btn-cancel" (click)="onDismiss()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button type="button" class="btn-danger" (click)="onConfirm()">
          <mat-icon>delete_outline</mat-icon>
          <span>{{ data.confirmText || 'Eliminar' }}</span>
        </button>
      </footer>
    </div>
  `,
  styles: [`
    .confirm-shell {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .confirm-body {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 24px 20px;

      .warn-badge {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        color: #e11d48;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon { font-size: 22px; width: 22px; height: 22px; }
      }

      .confirm-content {
        h2 {
          margin: 0 0 6px;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
        }
        p {
          margin: 0;
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.5;
        }
      }
    }
    .confirm-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .btn-cancel {
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
      padding: 0 16px;
      border-radius: 8px;
      background: #be123c;
      border: 1px solid #9f1239;
      color: #ffffff;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover { background: #9f1239; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
