import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Reportes y Estadísticas</h1>
      </header>
      
      <div class="reports-grid">
        <mat-card class="report-card" *ngFor="let report of availableReports">
          <mat-card-header>
            <mat-icon mat-card-avatar [color]="report.color">{{ report.icon }}</mat-icon>
            <mat-card-title>{{ report.title }}</mat-card-title>
            <mat-card-subtitle>{{ report.subtitle }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ report.description }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-stroked-button color="primary" (click)="generateReport(report, 'PDF')">
              <mat-icon>picture_as_pdf</mat-icon> PDF
            </button>
            <button mat-stroked-button color="accent" (click)="generateReport(report, 'Excel')">
              <mat-icon>table_view</mat-icon> EXCEL
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 30px; }
    .page-header { margin-bottom: 30px; h1 { margin: 0; color: #2c3e50; } }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
    .report-card { 
      padding: 10px; 
      border-radius: 12px; 
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
      mat-card-content { padding: 15px 0; color: #666; font-size: 0.9rem; }
      mat-card-actions { gap: 8px; }
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

  constructor(private snackBar: MatSnackBar) {}

  generateReport(report: any, format: string) {
    this.snackBar.open(`Generando ${format} de "${report.title}"...`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    // Simulación de descarga
    setTimeout(() => {
      this.snackBar.open(`${format} descargado correctamente`, 'OK', { duration: 2000 });
    }, 2000);
  }
}
