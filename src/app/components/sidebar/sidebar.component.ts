import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatTooltipModule, MatButtonModule],
  template: `
    <div class="sidebar" [class.collapsed]="isCollapsed">
      <div class="logo-container">
        <div class="logo-badge">
          <mat-icon class="logo-icon">balance</mat-icon>
        </div>
        <div class="logo-text-group" *ngIf="!isCollapsed">
          <span class="logo-text">UTAHIME</span>
          <span class="logo-subtext">CONTROL INDUSTRIAL</span>
        </div>
      </div>

      <div class="toggle-container">
        <button mat-icon-button (click)="toggleSidebar()" class="toggle-btn" aria-label="Alternar menú">
          <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <mat-nav-list>
        <a mat-list-item routerLink="/scale" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" 
           [matTooltip]="isCollapsed ? 'Báscula' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>monitor_weight</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Báscula</span>
        </a>

        <a mat-list-item routerLink="/clients" routerLinkActive="active-link" 
           [matTooltip]="isCollapsed ? 'Clientes' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>business</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Clientes</span>
        </a>

        <a mat-list-item routerLink="/drivers" routerLinkActive="active-link" 
           [matTooltip]="isCollapsed ? 'Choferes' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>local_shipping</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Choferes</span>
        </a>

        <a mat-list-item routerLink="/users" routerLinkActive="active-link" *ngIf="isAdmin()"
           [matTooltip]="isCollapsed ? 'Usuarios' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Usuarios</span>
        </a>

        <a mat-list-item routerLink="/reports" routerLinkActive="active-link" 
           [matTooltip]="isCollapsed ? 'Reportes' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>assessment</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Reportes</span>
        </a>
      </mat-nav-list>

      <div class="sidebar-spacer"></div>

      <div class="user-info" *ngIf="user() as u">
        <div class="user-avatar">{{ (u.nombre || '?').charAt(0) | uppercase }}</div>
        <div class="user-meta" *ngIf="!isCollapsed">
          <span class="user-name">{{ u.nombre }}</span>
          <span class="user-role">{{ u.rol | uppercase }}</span>
        </div>
      </div>

      <mat-nav-list class="bottom-nav">
        <a mat-list-item (click)="logout()" class="logout-link"
           [matTooltip]="isCollapsed ? 'Cerrar Sesión' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>logout</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Salir</span>
        </a>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background-color: var(--brand-navy);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 14px rgba(15, 23, 42, 0.18);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      border-right: 1px solid rgba(255, 255, 255, 0.06);

      /* Forzar texto e íconos blancos en Angular Material MDC list items */
      --mdc-list-list-item-label-text-color: #ffffff;
      --mdc-list-list-item-hover-label-text-color: #ffffff;
      --mdc-list-list-item-focus-label-text-color: #ffffff;
      --mdc-list-list-item-leading-icon-color: rgba(255, 255, 255, 0.85);
      --mdc-list-list-item-hover-leading-icon-color: #ffffff;
    }

    .sidebar.collapsed {
      width: 72px;
      .logo-container { padding: 20px 10px; justify-content: center; }
      mat-nav-list a { margin: 6px 8px; justify-content: center; }
    }

    .logo-container {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      background-color: var(--brand-dark);
      overflow: hidden;
      white-space: nowrap;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      .logo-badge {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(59, 130, 246, 0.16);
        border: 1px solid rgba(59, 130, 246, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .logo-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #60a5fa;
      }

      .logo-text-group {
        display: flex;
        flex-direction: column;
      }

      .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #ffffff;
        line-height: 1.15;
      }

      .logo-subtext {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 2px;
      }
    }

    .toggle-container {
      display: flex;
      justify-content: flex-end;
      padding: 5px;
      position: absolute;
      right: -15px;
      top: 72px;
      z-index: 10;
    }

    .toggle-btn {
      background-color: var(--brand-accent);
      color: #ffffff;
      width: 30px;
      height: 30px;
      padding: 0;
      line-height: normal;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      &:hover { background-color: var(--brand-accent-hover); }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        margin: 0;
        color: #ffffff;
      }

      ::ng-deep .mat-mdc-button-touch-target {
        width: 30px;
        height: 30px;
      }
    }

    mat-nav-list {
      padding-top: 14px;
      a {
        color: #ffffff !important;
        margin: 6px 12px;
        border-radius: 10px;
        height: 48px;
        transition: all 0.2s ease;
        overflow: hidden;

        ::ng-deep .mdc-list-item__primary-text {
          color: #ffffff !important;
          font-weight: 500;
          font-size: 0.94rem;
          letter-spacing: 0.01em;
        }

        mat-icon {
          color: rgba(255, 255, 255, 0.85) !important;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #ffffff !important;
          mat-icon { color: #ffffff !important; }
        }
        
        &.active-link {
          background-color: var(--brand-accent);
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);

          ::ng-deep .mdc-list-item__primary-text {
            color: #ffffff !important;
            font-weight: 600;
          }

          mat-icon { color: #ffffff !important; }
        }
      }
    }

    .sidebar-spacer { flex-grow: 1; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      margin: 0 12px 8px;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      overflow: hidden;
      white-space: nowrap;

      .user-avatar {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 8px;
        background-color: var(--brand-accent);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .user-meta { display: flex; flex-direction: column; overflow: hidden; }
      .user-name { font-size: 0.88rem; font-weight: 600; color: #ffffff; text-overflow: ellipsis; overflow: hidden; }
      .user-role { font-size: 0.68rem; font-weight: 600; color: #93c5fd; letter-spacing: 0.06em; margin-top: 2px; }
    }
    .sidebar.collapsed .user-info {
      justify-content: center;
      padding: 10px;
      margin: 0 8px 8px;
      background: transparent;
      border-color: transparent;
    }

    .bottom-nav {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 0 12px;
    }
    .logout-link { cursor: pointer; }
  `]
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  readonly isAdmin = this.auth.isAdmin;
  readonly user = this.auth.currentUser;

  @Input() isCollapsed = false;
  @Output() collapsedChanged = new EventEmitter<boolean>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChanged.emit(this.isCollapsed);
  }

  logout() {
    this.auth.logout();
  }
}
