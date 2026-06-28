import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="notification" [ngClass]="data.type" role="status">
      <mat-icon class="leading-icon">{{ icons[data.type] }}</mat-icon>
      <div class="content">
        <span class="message">{{ data.message }}</span>
        <span class="detail" *ngIf="data.detail">{{ data.detail }}</span>
      </div>
      <button mat-icon-button class="close-btn" (click)="close()" aria-label="Cerrar notificación">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .notification {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 320px;
      max-width: 440px;
      padding: 14px 12px 14px 16px;
      background: var(--surface);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
      border-left: 5px solid var(--brand-primary);
    }

    .leading-icon {
      flex-shrink: 0;
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: var(--brand-primary);
    }

    .notification.success { border-left-color: var(--color-success); }
    .notification.success .leading-icon { color: var(--color-success); }
    .notification.error { border-left-color: var(--color-danger); }
    .notification.error .leading-icon { color: var(--color-danger); }
    .notification.info { border-left-color: var(--brand-primary); }
    .notification.info .leading-icon { color: var(--brand-primary); }

    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .message {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-strong);
      line-height: 1.3;
    }
    .detail {
      margin-top: 2px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .close-btn {
      flex-shrink: 0;
      color: var(--text-faint);
      width: 32px;
      height: 32px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `]
})
export class NotificationComponent {
  readonly data = inject<NotificationData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef);

  readonly icons: Record<NotificationType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  close(): void {
    this.ref.dismiss();
  }
}
