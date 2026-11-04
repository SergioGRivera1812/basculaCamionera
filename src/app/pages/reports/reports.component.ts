import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="reports-page">
      <header class="page-header">
        <div class="header-title-group">
          <div class="header-icon-box">
            <mat-icon>assessment</mat-icon>
          </div>
          <div>
            <h1>Reportes y Estadísticas Operativas</h1>
            <p class="header-subtitle">Exportación de informes gerenciales, balances de carga y auditoría</p>
          </div>
        </div>

        <div class="header-meta">
          <div class="meta-pill">
            <span class="meta-label">Módulos</span>
            <span class="meta-value">{{ availableReports.length }}</span>
          </div>
        </div>
      </header>

      <div class="reports-grid">
        <article class="report-card" *ngFor="let report of availableReports">
          <div class="card-top">
            <div class="icon-badge">
              <mat-icon>{{ report.icon }}</mat-icon>
            </div>
            <span class="category-tag">{{ report.subtitle }}</span>
          </div>

          <div class="card-body">
            <h3>{{ report.title }}</h3>
            <p>{{ report.description }}</p>
          </div>

          <div class="card-footer">
            <span class="export-label">EXPORTAR FORMATO</span>
            <div class="export-actions">
              <button type="button" class="btn-export pdf" (click)="generateReport(report, 'PDF')">
                <mat-icon>picture_as_pdf</mat-icon>
                <span>PDF</span>
              </button>
              <button type="button" class="btn-export excel" (click)="generateReport(report, 'Excel')">
                <mat-icon>table_view</mat-icon>
                <span>EXCEL</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      padding: 24px 28px 32px;
      min-height: 100vh;
      background-color: var(--bg-app);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      background: #ffffff;
      padding: 16px 22px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 14px;

        .header-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;

          mat-icon {
            font-size: 22px;
            width: 22px;
            height: 22px;
          }
        }

        h1 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .header-subtitle {
          margin: 2px 0 0;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }
      }

      .meta-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;

        .meta-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .meta-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          background: #e2e8f0;
          padding: 2px 7px;
          border-radius: 5px;
        }
      }
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 18px;
    }

    .report-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 18px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.08);
        transform: translateY(-2px);
      }
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .icon-badge {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: #0f172a;
        color: #60a5fa;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 21px;
          width: 21px;
          height: 21px;
        }
      }

      .category-tag {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #475569;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        padding: 4px 10px;
        border-radius: 6px;
      }
    }

    .card-body {
      h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.01em;
      }

      p {
        margin: 0;
        font-size: 0.86rem;
        color: #64748b;
        line-height: 1.5;
      }
    }

    .card-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      .export-label {
        font-size: 0.68rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.08em;
      }

      .export-actions {
        display: flex;
        gap: 8px;
      }
    }

    .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-shadow: 0 1px 0 #e2e8f0;
      color: #1e293b;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.15s ease;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.pdf mat-icon {
        color: #e11d48;
      }

      &.excel mat-icon {
        color: #059669;
      }

      &:hover {
        background: #f8fafc;
        border-color: #94a3b8;
        color: #0f172a;
      }

      &:active {
        transform: translateY(1px);
      }
    }
  `]
})
export class ReportsComponent {
  availableReports = [
    { 
      id: 1, title: 'Reporte Diario', subtitle: 'Pesajes del día', icon: 'today', color: 'primary',
      description: 'Detalle cronológico de todas las entradas y salidas registradas en las últimas 24 horas.'
    },
    { 
      id: 2, title: 'Pesajes por Cliente', subtitle: 'Consolidado mensual', icon: 'business', color: 'accent',
      description: 'Resumen de toneladas movidas por cada cliente registrado en el sistema.'
    },
    { 
      id: 3, title: 'Inventario de Producto', subtitle: 'Balance neto', icon: 'inventory_2', color: 'warn',
      description: 'Diferencia entre entradas y salidas totales por tipo de producto (Maíz, Soya, etc).'
    },
    { 
      id: 4, title: 'Eficiencia de Choferes', subtitle: 'Frecuencia de viajes', icon: 'local_shipping', color: 'primary',
      description: 'Estadísticas de puntualidad y volumen de carga transportado por cada chofer.'
    },
    { 
      id: 5, title: 'Auditoría de Usuarios', subtitle: 'Logs del sistema', icon: 'security', color: 'accent',
      description: 'Registro de modificaciones y operaciones críticas realizadas por los operadores.'
    },
    { 
      id: 6, title: 'Reporte de Cancelaciones', subtitle: 'Tickets anulados', icon: 'block', color: 'warn',
      description: 'Análisis de tickets cancelados y motivos registrados por el personal.'
    }
  ];

  private readonly notify = inject(NotificationService);

  generateReport(report: any, format: string) {
    this.notify.info(`Generando ${format}`, report.title);

    // Simulación de descarga
    setTimeout(() => {
      this.notify.success(`${format} descargado correctamente`, report.title);
    }, 2000);
  }
}
