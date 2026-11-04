import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { NotificationService } from '../../services/notification.service';
import { BasculaService } from '../../services/bascula.service';
import { MaterialesService } from '../../services/materiales.service';
import { UsuariosService } from '../../services/usuarios.service';
import {
  EntradaBascula,
  Material,
  TipoOperacion,
  Transaccion,
  Usuario,
} from '../../models/database.models';

interface ReportDefinition {
  id: number;
  key: 'diario' | 'clientes' | 'materiales' | 'choferes' | 'usuarios' | 'cancelaciones';
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

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
            <p class="header-subtitle">Exportación real en PDF y Excel basada en vista_transacciones</p>
          </div>
        </div>

        <div class="header-meta">
          <div class="meta-pill">
            <span class="meta-label">Transacciones cargadas</span>
            <span class="meta-value">{{ transacciones().length }}</span>
          </div>
          <div class="meta-pill">
            <span class="meta-label">Módulos</span>
            <span class="meta-value">{{ availableReports.length }}</span>
          </div>
          <button type="button" class="btn-refresh" (click)="cargarDatosBase()">
            <mat-icon>refresh</mat-icon>
            <span>Sincronizar Datos</span>
          </button>
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
            <span class="export-label">DESCARGAR ARCHIVO</span>
            <div class="export-actions">
              <button
                type="button"
                class="btn-export pdf"
                [disabled]="isGenerating()"
                (click)="exportarPDF(report)"
              >
                <mat-icon>picture_as_pdf</mat-icon>
                <span>PDF</span>
              </button>
              <button
                type="button"
                class="btn-export excel"
                [disabled]="isGenerating()"
                (click)="exportarExcel(report)"
              >
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

      .header-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
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

      .btn-refresh {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 14px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #1e293b;
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        mat-icon {
          font-size: 17px;
          width: 17px;
          height: 17px;
          color: #64748b;
        }

        &:hover {
          background: #f8fafc;
          border-color: #94a3b8;
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

      &:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #94a3b8;
        color: #0f172a;
      }

      &:active:not(:disabled) {
        transform: translateY(1px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `],
})
export class ReportsComponent implements OnInit {
  private readonly notify = inject(NotificationService);
  private readonly basculaService = inject(BasculaService);
  private readonly materialesService = inject(MaterialesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly transacciones = signal<Transaccion[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly isGenerating = signal<boolean>(false);

  availableReports: ReportDefinition[] = [
    {
      id: 1,
      key: 'diario',
      title: 'Reporte Diario',
      subtitle: 'Pesajes del día',
      icon: 'today',
      description: 'Detalle cronológico de todas las entradas y salidas registradas en vista_transacciones.',
    },
    {
      id: 2,
      key: 'clientes',
      title: 'Pesajes por Cliente',
      subtitle: 'Consolidado comercial',
      icon: 'business',
      description: 'Resumen de kilogramos netos y viajes agrupados por cada cliente/proveedor registrado.',
    },
    {
      id: 3,
      key: 'materiales',
      title: 'Balance de Materiales',
      subtitle: 'Balance neto',
      icon: 'inventory_2',
      description: 'Comparativa entre Recepción (Compra/Descarga) y Despacho (Venta/Carga) por tipo de material.',
    },
    {
      id: 4,
      key: 'choferes',
      title: 'Eficiencia de Choferes',
      subtitle: 'Frecuencia de viajes',
      icon: 'local_shipping',
      description: 'Estadísticas de viajes realizados, unidades en patio y volumen transportado por chofer.',
    },
    {
      id: 5,
      key: 'usuarios',
      title: 'Auditoría de Usuarios',
      subtitle: 'Padrón de acceso',
      icon: 'security',
      description: 'Listado de cuentas de operadores y administradores dados de alta en el sistema.',
    },
    {
      id: 6,
      key: 'cancelaciones',
      title: 'Unidades Pendientes y Anuladas',
      subtitle: 'Control de patio',
      icon: 'block',
      description: 'Análisis de tickets pendientes de cierre o anulados en patio con motivo registrado.',
    },
  ];

  ngOnInit(): void {
    this.cargarDatosBase();
  }

  cargarDatosBase(): void {
    forkJoin({
      activas: this.basculaService.getEntradasActivas().pipe(catchError(() => of([] as EntradaBascula[]))),
      transacciones: this.basculaService.getHistorialCompleto().pipe(catchError(() => of([] as Transaccion[]))),
      materiales: this.materialesService.getMateriales().pipe(catchError(() => of([] as Material[]))),
      usuarios: this.usuariosService.getUsuarios().pipe(catchError(() => of([] as Usuario[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ activas, transacciones, materiales, usuarios }) => {
        const matMap = new Map<number, string>();
        for (const m of materiales || []) {
          if (m.id != null) matMap.set(m.id, m.nombre);
        }

        const activasMap = new Map<number, EntradaBascula>();
        for (const a of activas || []) {
          activasMap.set(Number(a.codigoEntrada), a);
        }

        const norm = (transacciones || []).map((t: any) => {
          const folio = Number(t.codigoEntrada || t.folio);
          const matchAct = activasMap.get(folio);
          const idMat = t.id_material ?? matchAct?.id_material;
          const tipoOp: TipoOperacion = t.tipo_operacion || matchAct?.tipo_operacion || 'DESPACHO';
          const rawEstado = String(t.estado || '').trim().toLowerCase();
          const tieneSalida = Number(t.bruto) > 0 || rawEstado === 'completado';
          const estadoNorm: 'completado' | 'pendiente' | 'cancelado' = tieneSalida
            ? 'completado'
            : !activasMap.has(folio) || t.activo === 0 || !!t.motivo_cancelacion
            ? 'cancelado'
            : 'pendiente';

          return {
            ...t,
            folio,
            codigoEntrada: folio,
            chofer: t.chofer || t.nombre_chofer || matchAct?.nombre_chofer || 'Sin asignar',
            nombre_chofer: t.nombre_chofer || t.chofer || matchAct?.nombre_chofer || 'Sin asignar',
            material:
              t.material ||
              matchAct?.material ||
              (idMat ? matMap.get(idMat) : undefined) ||
              'Material General',
            tipo_operacion: tipoOp,
            fecha_entrada: t.fecha_entrada || t.fecha || matchAct?.fecha_entrada || '',
            fecha_salida: t.fecha_salida || (tieneSalida ? t.fecha : '') || '',
            estado: estadoNorm,
          } as Transaccion;
        });

        this.transacciones.set(norm);
        this.usuarios.set(usuarios || []);
      });
  }

  // ============================================================
  // EXPORTACIÓN REAL A PDF (jsPDF + jspdf-autotable)
  // ============================================================
  exportarPDF(report: ReportDefinition): void {
    this.isGenerating.set(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const nowStr = new Date().toLocaleString('es-MX');
      const rows = this.transacciones();

      // Encabezado Institucional
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 297, 26, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BASCU-SYS · BÁSCULA CAMIONERA CENTRAL', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`${report.title.toUpperCase()} — ${report.subtitle}`, 14, 18);
      doc.text(`Generado: ${nowStr}`, 283, 14, { align: 'right' });

      if (report.key === 'materiales') {
        // Balance de Materiales agrupado + Detalle
        const resumenMateriales = this.calcularBalanceMateriales(rows);
        autoTable(doc, {
          startY: 32,
          head: [['Material / Producto', 'Viajes', 'Recepción / Entrada (kg)', 'Despacho / Salida (kg)', 'Balance Neto (kg)']],
          body: resumenMateriales.map((m) => [
            m.material,
            m.viajes.toString(),
            m.recepcionKg.toLocaleString('es-MX'),
            m.despachoKg.toLocaleString('es-MX'),
            m.balanceKg.toLocaleString('es-MX'),
          ]),
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 3.5 },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 60;
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalle de Transacciones por Material', 14, finalY + 10);

        autoTable(doc, {
          startY: finalY + 14,
          head: [['Folio', 'Operación', 'Material', 'Cliente', 'Chofer', 'Tara (kg)', 'Bruto (kg)', 'Neto (kg)', 'Fecha']],
          body: rows.map((t) => this.mapRowToPdfArray(t)),
          headStyles: { fillColor: [15, 23, 42], textColor: 255 },
          styles: { fontSize: 8.5 },
        });
      } else if (report.key === 'clientes') {
        const resumenClientes = this.calcularResumenClientes(rows);
        autoTable(doc, {
          startY: 32,
          head: [['Cliente / Proveedor', 'Total Operaciones', 'Total Tara (kg)', 'Total Bruto (kg)', 'Total Neto Acumulado (kg)']],
          body: resumenClientes.map((c) => [
            c.cliente,
            c.operaciones.toString(),
            c.taraTotal.toLocaleString('es-MX'),
            c.brutoTotal.toLocaleString('es-MX'),
            c.netoTotal.toLocaleString('es-MX'),
          ]),
          headStyles: { fillColor: [30, 41, 59], textColor: 255 },
          styles: { fontSize: 9 },
        });
      } else if (report.key === 'choferes') {
        const resumenChoferes = this.calcularResumenChoferes(rows);
        autoTable(doc, {
          startY: 32,
          head: [['Chofer / Operador', 'Viajes Totales', 'Completados', 'En Planta', 'Volumen Neto Transportado (kg)']],
          body: resumenChoferes.map((c) => [
            c.chofer,
            c.viajes.toString(),
            c.completados.toString(),
            c.pendientes.toString(),
            c.netoTotal.toLocaleString('es-MX'),
          ]),
          headStyles: { fillColor: [30, 41, 59], textColor: 255 },
          styles: { fontSize: 9 },
        });
      } else if (report.key === 'usuarios') {
        const users = this.usuarios();
        autoTable(doc, {
          startY: 32,
          head: [['ID', 'Usuario (Login)', 'Nombre Completo', 'Rol de Sistema', 'Fecha de Registro']],
          body: users.map((u) => [
            `#${u.id ?? '-'}`,
            u.usuario,
            u.nombre,
            (u.rol || 'operador').toUpperCase(),
            u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-MX') : 'Activo',
          ]),
          headStyles: { fillColor: [30, 41, 59], textColor: 255 },
          styles: { fontSize: 9 },
        });
      } else {
        // Reporte Diario / Unidades Pendientes y Cancelaciones
        const sourceRows =
          report.key === 'cancelaciones'
            ? rows.filter((r) => r.estado !== 'completado' || !!r.motivo_cancelacion)
            : rows;

        autoTable(doc, {
          startY: 32,
          head: [['Folio', 'Operación', 'Material', 'Cliente', 'Chofer', 'Tara (kg)', 'Bruto (kg)', 'Neto (kg)', 'Fecha']],
          body: sourceRows.map((t) => this.mapRowToPdfArray(t)),
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8.5, cellPadding: 3 },
        });
      }

      const fileName = `BASCU-SYS_${report.key}_${this.getFechaArchivo()}.pdf`;
      doc.save(fileName);
      this.notify.success('PDF generado correctamente', fileName);
    } catch (err: any) {
      this.notify.error('Error al generar PDF', err?.message || 'Verifique los datos');
    } finally {
      this.isGenerating.set(false);
    }
  }

  // ============================================================
  // EXPORTACIÓN REAL A EXCEL (SheetJS / xlsx)
  // Columnas oficiales: Folio (codigoEntrada), Chofer (nombre_chofer),
  // Material (material), Cliente (cliente), Tara, Bruto, Neto y Fechas.
  // ============================================================
  exportarExcel(report: ReportDefinition): void {
    this.isGenerating.set(true);
    try {
      const rows = this.transacciones();
      const wb = XLSX.utils.book_new();

      const sourceRows =
        report.key === 'cancelaciones'
          ? rows.filter((r) => r.estado !== 'completado' || !!r.motivo_cancelacion)
          : rows;

      // Hoja principal formateada con las columnas oficiales requeridas
      const excelData = sourceRows.map((t) => ({
        'Folio (codigoEntrada)': Number(t.codigoEntrada || t.folio),
        'Tipo Operación': t.tipo_operacion || 'DESPACHO',
        'Chofer (nombre_chofer)': t.nombre_chofer || t.chofer || '',
        'Material (material)': t.material || 'Material General',
        'Cliente (cliente)': t.cliente || '',
        'Tara (kg)': Number(t.tara) || 0,
        'Bruto (kg)': Number(t.bruto) || 0,
        'Neto (kg)': Number(t.neto) || 0,
        'Fecha Entrada': this.formatearFecha(t.fecha_entrada || t.fecha),
        'Fecha Salida': this.formatearFecha(t.fecha_salida),
        Estado: (t.estado || 'pendiente').toUpperCase(),
      }));

      const ws = XLSX.utils.json_to_sheet(
        excelData.length > 0
          ? excelData
          : [
              {
                'Folio (codigoEntrada)': '-',
                'Tipo Operación': '-',
                'Chofer (nombre_chofer)': 'Sin registros disponibles',
                'Material (material)': '-',
                'Cliente (cliente)': '-',
                'Tara (kg)': 0,
                'Bruto (kg)': 0,
                'Neto (kg)': 0,
                'Fecha Entrada': '-',
                'Fecha Salida': '-',
                Estado: '-',
              },
            ]
      );

      // Ajuste de ancho de columnas
      ws['!cols'] = [
        { wch: 18 },
        { wch: 16 },
        { wch: 26 },
        { wch: 22 },
        { wch: 28 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
        { wch: 20 },
        { wch: 16 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

      // Si es Balance de Materiales, agregamos una segunda pestaña con el consolidado
      if (report.key === 'materiales') {
        const balance = this.calcularBalanceMateriales(rows).map((b) => ({
          Material: b.material,
          'Total Viajes': b.viajes,
          'Recepción / Entrada (kg)': b.recepcionKg,
          'Despacho / Salida (kg)': b.despachoKg,
          'Balance Neto (kg)': b.balanceKg,
        }));
        const wsBalance = XLSX.utils.json_to_sheet(balance);
        wsBalance['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance_Materiales');
      }

      const fileName = `BASCU-SYS_${report.key}_${this.getFechaArchivo()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      this.notify.success('Excel descargado correctamente', fileName);
    } catch (err: any) {
      this.notify.error('Error al exportar Excel', err?.message || 'Verifique los datos');
    } finally {
      this.isGenerating.set(false);
    }
  }

  private mapRowToPdfArray(t: Transaccion): string[] {
    return [
      `#${t.codigoEntrada || t.folio}`,
      t.tipo_operacion || 'DESPACHO',
      t.material || 'General',
      t.cliente || '-',
      t.nombre_chofer || t.chofer || '-',
      (Number(t.tara) || 0).toLocaleString('es-MX'),
      (Number(t.bruto) || 0).toLocaleString('es-MX'),
      (Number(t.neto) || 0).toLocaleString('es-MX'),
      this.formatearFecha(t.fecha_entrada || t.fecha),
    ];
  }

  private calcularBalanceMateriales(rows: Transaccion[]) {
    const map = new Map<
      string,
      { material: string; viajes: number; recepcionKg: number; despachoKg: number; balanceKg: number }
    >();

    for (const r of rows) {
      const mat = r.material || 'Material General';
      const current = map.get(mat) || {
        material: mat,
        viajes: 0,
        recepcionKg: 0,
        despachoKg: 0,
        balanceKg: 0,
      };
      const neto = Number(r.neto) || 0;
      current.viajes += 1;
      if (r.tipo_operacion === 'RECEPCION') {
        current.recepcionKg += neto;
      } else {
        current.despachoKg += neto;
      }
      current.balanceKg = current.recepcionKg - current.despachoKg;
      map.set(mat, current);
    }
    return Array.from(map.values());
  }

  private calcularResumenClientes(rows: Transaccion[]) {
    const map = new Map<
      string,
      { cliente: string; operaciones: number; taraTotal: number; brutoTotal: number; netoTotal: number }
    >();
    for (const r of rows) {
      const cli = r.cliente || 'CLIENTE MOSTRADOR';
      const cur = map.get(cli) || {
        cliente: cli,
        operaciones: 0,
        taraTotal: 0,
        brutoTotal: 0,
        netoTotal: 0,
      };
      cur.operaciones += 1;
      cur.taraTotal += Number(r.tara) || 0;
      cur.brutoTotal += Number(r.bruto) || 0;
      cur.netoTotal += Number(r.neto) || 0;
      map.set(cli, cur);
    }
    return Array.from(map.values());
  }

  private calcularResumenChoferes(rows: Transaccion[]) {
    const map = new Map<
      string,
      { chofer: string; viajes: number; completados: number; pendientes: number; netoTotal: number }
    >();
    for (const r of rows) {
      const ch = r.nombre_chofer || r.chofer || 'Sin asignar';
      const cur = map.get(ch) || {
        chofer: ch,
        viajes: 0,
        completados: 0,
        pendientes: 0,
        netoTotal: 0,
      };
      cur.viajes += 1;
      if (r.estado === 'completado') cur.completados += 1;
      else cur.pendientes += 1;
      cur.netoTotal += Number(r.neto) || 0;
      map.set(ch, cur);
    }
    return Array.from(map.values());
  }

  private formatearFecha(raw?: string): string {
    if (!raw) return '-';
    const d = new Date(raw);
    return isNaN(d.getTime()) ? raw : d.toLocaleString('es-MX');
  }

  private getFechaArchivo(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
