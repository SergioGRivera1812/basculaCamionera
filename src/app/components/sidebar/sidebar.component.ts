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
        <mat-icon class="logo-icon">balance</mat-icon>
        <span class="logo-text" *ngIf="!isCollapsed">BASCU-SYS</span>
      </div>

      <div class="toggle-container">
        <button mat-icon-button (click)="toggleSidebar()" class="toggle-btn">
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
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .sidebar.collapsed {
      width: 70px;
      .logo-container { padding: 20px 10px; justify-content: center; }
      mat-nav-list a { margin: 5px 5px; justify-content: center; }
    }

    .logo-container {
      padding: 30px 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      background-color: var(--brand-dark);
      overflow: hidden;
      white-space: nowrap;

      .logo-icon { font-size: 2.5rem; width: 40px; height: 40px; color: var(--brand-accent); flex-shrink: 0; }
      .logo-text { font-size: 1.5rem; font-weight: bold; letter-spacing: 1px; }
    }

    .toggle-container {
      display: flex;
      justify-content: flex-end;
      padding: 5px;
      position: absolute;
      right: -15px;
      top: 75px;
      z-index: 10;
    }

    .toggle-btn {
      background-color: var(--brand-accent);
      color: white;
      width: 30px;
      height: 30px;
      padding: 0;
      line-height: normal;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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
      }

      // El "touch target" de Material (48px, absoluto) puede descentrar el contenido.
      ::ng-deep .mat-mdc-button-touch-target {
        width: 30px;
        height: 30px;
      }
    }

    mat-nav-list {
      padding-top: 10px;
      a {
        color: var(--sidebar-text);
        margin: 5px 10px;
        border-radius: 8px;
        height: 50px;
        transition: all 0.2s;
        overflow: hidden;
        
        &:hover { background-color: rgba(255, 255, 255, 0.05); color: white; }
        
        &.active-link {
          background-color: var(--brand-accent);
          color: white;
          mat-icon { color: white; }
        }

        mat-icon { color: var(--sidebar-text); flex-shrink: 0; }
      }
    }

    .sidebar-spacer { flex-grow: 1; }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      overflow: hidden;
      white-space: nowrap;

      .user-avatar {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        border-radius: 50%;
        background-color: var(--brand-accent);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      .user-meta { display: flex; flex-direction: column; overflow: hidden; }
      .user-name { font-size: 0.9rem; font-weight: 600; color: white; text-overflow: ellipsis; overflow: hidden; }
      .user-role { font-size: 0.7rem; color: var(--brand-accent); letter-spacing: 0.5px; }
    }
    .sidebar.collapsed .user-info { justify-content: center; padding: 12px 10px; }

    .bottom-nav { border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 0; }
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
