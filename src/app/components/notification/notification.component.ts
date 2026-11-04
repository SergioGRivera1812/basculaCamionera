import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationData {
  type: NotificationType;
  message: string;
  detail?: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="notification" [ngClass]="data.type" role="status">
      <div class="icon-badge">
        <mat-icon>{{ icons[data.type] }}</mat-icon>
      </div>
      <div class="content">
        <span class="message">{{ data.message }}</span>
        <span class="detail" *ngIf="data.detail">{{ data.detail }}</span>
      </div>
      <button type="button" class="close-btn" (click)="close()" aria-label="Cerrar notificación">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .notification {
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 330px;
      max-width: 440px;
      padding: 13px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      box-shadow: 0 14px 30px -6px rgba(15, 23, 42, 0.45);
      color: #f8fafc;
    }

    .icon-badge {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(59, 130, 246, 0.14);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;

      mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
    }

    .notification.success .icon-badge {
      background: rgba(16, 185, 129, 0.14);
      border-color: rgba(16, 185, 129, 0.35);
      color: #34d399;
    }

    .notification.error .icon-badge {
      background: rgba(244, 63, 94, 0.15);
      border-color: rgba(244, 63, 94, 0.38);
      color: #fb7185;
    }

    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .message {
      font-weight: 600;
      font-size: 0.88rem;
      color: #ffffff;
      line-height: 1.3;
    }

    .detail {
      margin-top: 2px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.76rem;
      color: #94a3b8;
    }

    .close-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #64748b;
      width: 28px;
      height: 28px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
      }

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
  `]
})
export class NotificationComponent {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef);

  readonly icons: Record<NotificationType, string> = {
    success: 'check_circle',
    error: 'error_outline',
    info: 'info',
  };

  close(): void {
    this.ref.dismiss();
  }
}
