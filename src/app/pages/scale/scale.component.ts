import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { WeighingFormDialogComponent } from './components/weighing-form-dialog/weighing-form-dialog.component';
import { TransactionDetailsDialogComponent } from './components/transaction-details-dialog/transaction-details-dialog.component';
import { BasculaService } from '../../services/bascula.service';
import { EntradaBascula, SalidaBascula } from '../../models/database.models';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.scss'
})
export class ScaleComponent implements OnInit {
  currentWeight: number = 0;
  tare: number = 0;
  net: number = 0;
  gross: number = 0;
  unit: string = 'kg';

  // Historial de la tabla
  recentTransactions: any[] = [];
  entradasActivas: EntradaBascula[] = [];
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private basculaService: BasculaService
  ) {
    // Simulación de peso en tiempo real
    this.currentWeight = 24503;
    this.gross = 12540;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.basculaService.getEntradasActivas().subscribe(data => this.entradasActivas = data);
    this.basculaService.getHistorialCompleto().subscribe(data => {
      this.recentTransactions = data;
      this.dataSource.data = data;
      
      // Personalizar el filtro para que busque en todos los campos visibles
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        const searchStr = `${data.folio} ${data.cliente} ${data.chofer} ${data.placa || ''}`.toLowerCase();
        return searchStr.includes(filter);
      };
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onTarar(): void {
    this.tare = this.currentWeight;
    this.net = Math.abs(this.gross - this.tare);
    this.showNotification('Peso Tarado correctamente');
  }

  onCero(): void {
    this.currentWeight = 0;
    this.gross = 0;
    this.tare = 0;
    this.net = 0;
    this.showNotification('Báscula puesta a Cero');
  }

  onImprimir(): void {
    if (this.currentWeight <= 0) {
      this.showNotification('No hay peso detectado en la báscula');
      return;
    }

    const isSalida = this.tare > 0;
    
    const dialogRef = this.dialog.open(WeighingFormDialogComponent, {
      width: '500px',
      data: { 
        weight: this.currentWeight, 
        type: isSalida ? 'salida' : 'entrada',
        tare: this.tare,
        entradasActivas: this.entradasActivas 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isSalida) {
          this.guardarSalida(result);
        } else {
          this.guardarEntrada(result);
        }
      }
    });
  }

  onFinalizarSalida(transaction: any): void {
    if (this.currentWeight <= 0) {
      this.showNotification('Debe haber un camión en la báscula para registrar la salida');
      return;
    }

    const dialogRef = this.dialog.open(WeighingFormDialogComponent, {
      width: '500px',
      data: { 
        weight: this.currentWeight, 
        type: 'salida',
        tare: transaction.tara,
        plate: transaction.placa,
        driver: transaction.chofer,
        cliente: transaction.cliente,
        product_id: transaction.id_material,
        codigoEntrada: transaction.codigoEntrada || transaction.folio
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.guardarSalida(result);
      }
    });
  }

  onCancelar(): void {
    this.onCero();
    this.showNotification('Operación cancelada y báscula reseteada');
  }

  private guardarEntrada(data: any): void {
    const nuevaEntrada: EntradaBascula = {
      codigoEntrada: data.codigoEntrada || Math.floor(100000 + Math.random() * 900000),
      nombre_chofer: data.driver,
      id_material: data.product_id,
      cliente: data.cliente || 'CLIENTE MOSTRADOR',
      tara: data.weight,
      activo: 1
    };

    this.basculaService.registrarEntrada(nuevaEntrada).subscribe({
      next: () => {
        this.showNotification(`Ticket de Entrada #${nuevaEntrada.codigoEntrada} guardado`);
        this.onCero();
        this.cargarDatos();
      },
      error: (err) => this.showNotification('Error al registrar: ' + err.message)
    });
  }

  private guardarSalida(data: any): void {
    const codigo = data.codigoEntrada || (this.entradasActivas.length > 0 ? this.entradasActivas[0].codigoEntrada : null);

    if (!codigo) {
      this.showNotification('Error: No se encontró una entrada previa para este ticket');
      return;
    }

    const nuevaSalida: SalidaBascula = {
      codigoEntrada: codigo,
      bruto: data.weight,
      neto: Math.abs(data.weight - this.tare),
      activo: 0
    };

    this.basculaService.registrarSalida(nuevaSalida).subscribe({
      next: () => {
        this.showNotification(`Ticket de Salida #${codigo} completado exitosamente`);
        this.onCero();
        this.cargarDatos();
      },
      error: (err) => this.showNotification('Error al completar salida: ' + err.message)
    });
  }

  viewTransaction(t: any): void {
    this.dialog.open(TransactionDetailsDialogComponent, {
      width: '450px',
      data: t
    });
  }

  printTransaction(t: any): void {
    this.showNotification(`Reimprimiendo ticket #${t.codigoEntrada || t.folio}...`);
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
