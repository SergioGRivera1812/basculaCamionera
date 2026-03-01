import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

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

        <a mat-list-item routerLink="/users" routerLinkActive="active-link" 
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

      <mat-nav-list class="bottom-nav">
        <a mat-list-item routerLink="/" [matTooltip]="isCollapsed ? 'Cerrar Sesión' : ''" matTooltipPosition="right">
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
      background-color: #2c3e50;
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
      background-color: #1a252f;
      overflow: hidden;
      white-space: nowrap;

      .logo-icon { font-size: 2.5rem; width: 40px; height: 40px; color: #3498db; flex-shrink: 0; }
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
      background-color: #3498db;
      color: white;
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      &:hover { background-color: #2980b9; }
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    mat-nav-list {
      padding-top: 10px;
      a {
        color: #bdc3c7;
        margin: 5px 10px;
        border-radius: 8px;
        height: 50px;
        transition: all 0.2s;
        overflow: hidden;
        
        &:hover { background-color: rgba(255, 255, 255, 0.05); color: white; }
        
        &.active-link {
          background-color: #3498db;
          color: white;
          mat-icon { color: white; }
        }

        mat-icon { color: #bdc3c7; flex-shrink: 0; }
      }
    }

    .sidebar-spacer { flex-grow: 1; }
    .bottom-nav { border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 0; }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() collapsedChanged = new EventEmitter<boolean>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChanged.emit(this.isCollapsed);
  }
}
