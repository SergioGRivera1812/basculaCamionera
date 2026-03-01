import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private basculaService: BasculaService
  ) {
    // Simulación de peso en tiempo real
    this.currentWeight = 12540;
    this.gross = 12540;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.basculaService.getEntradasActivas().subscribe(data => this.entradasActivas = data);
    this.basculaService.getHistorialCompleto().subscribe(data => this.recentTransactions = data);
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
    // Si hay una entrada activa para este camión, es una SALIDA
    const dialogRef = this.dialog.open(WeighingFormDialogComponent, {
      width: '500px',
      data: { 
        weight: this.currentWeight, 
        type: this.tare > 0 ? 'salida' : 'entrada', // Basado en si se ha tarado
        tare: this.tare,
        // Enviar lista de entradas activas por si es salida
        entradasActivas: this.entradasActivas 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.type === 'entrada') {
          this.guardarEntrada(result);
        } else {
          this.guardarSalida(result);
        }
      }
    });
  }

  onCancelar(): void {
    this.showNotification('Operación cancelada');
  }

  private guardarEntrada(data: any): void {
    const nuevaEntrada: EntradaBascula = {
      codigoEntrada: Math.floor(100000 + Math.random() * 900000), // Generación de código único
      nombre_chofer: data.driver,
      id_material: data.product_id || 1, // Por defecto material 1
      cliente: data.cliente || 'CLIENTE MOSTRADOR',
      tara: data.weight,
      activo: 1
    };

    this.basculaService.registrarEntrada(nuevaEntrada).subscribe({
      next: () => {
        this.showNotification(`Entrada registrada exitosamente`);
        this.cargarDatos();
      },
      error: (err) => this.showNotification('Error al registrar entrada: ' + err.message)
    });
  }

  private guardarSalida(data: any): void {
    const nuevaSalida: SalidaBascula = {
      codigoEntrada: data.codigoEntrada,
      bruto: data.weight,
      neto: Math.abs(data.weight - data.tare),
      activo: 0
    };

    this.basculaService.registrarSalida(nuevaSalida).subscribe({
      next: () => {
        this.showNotification(`Salida completada exitosamente`);
        this.cargarDatos();
      },
      error: (err) => this.showNotification('Error al registrar salida: ' + err.message)
    });
  }

  viewTransaction(t: any): void {
    this.dialog.open(TransactionDetailsDialogComponent, {
      width: '450px',
      data: t
    });
  }

  printTransaction(t: any): void {
    this.showNotification(`Reimprimiendo ticket #${t.codigoEntrada || t.id}...`);
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
