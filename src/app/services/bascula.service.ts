import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EntradaBascula,
  CrearEntrada,
  CrearSalida,
  SalidaResponse,
  Transaccion,
  TipoOperacion,
} from '../models/database.models';
import { environment } from '../../environments/environment';

export type ModoConexionBascula = 'serial' | 'websocket' | 'simulacion';

export interface TicketImpresion {
  folio: number;
  tipo_operacion: TipoOperacion;
  fecha_entrada?: string;
  fecha_salida?: string;
  chofer: string;
  placa?: string;
  cliente: string;
  material: string;
  tara: number;
  bruto?: number;
  neto?: number;
  estado: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BasculaService implements OnDestroy {
  private readonly API_URL = environment.apiUrl;

  // ============================================================
  // Estado Reactivo de Hardware (Signals)
  // ============================================================
  private readonly _pesoActual = signal<number>(0);
  private readonly _estable = signal<boolean>(true);
  private readonly _modoConexion = signal<ModoConexionBascula>('simulacion');
  private readonly _hardwareConectado = signal<boolean>(false);
  private readonly _ticketActual = signal<TicketImpresion | null>(null);

  readonly pesoActual = this._pesoActual.asReadonly();
  readonly estable = this._estable.asReadonly();
  readonly modoConexion = this._modoConexion.asReadonly();
  readonly hardwareConectado = this._hardwareConectado.asReadonly();
  readonly ticketActual = this._ticketActual.asReadonly();

  readonly etiquetaModo = computed(() => {
    const modo = this._modoConexion();
    if (modo === 'serial') return 'PUERTO SERIAL (RS-232)';
    if (modo === 'websocket') return 'WEBSOCKET LOCAL';
    return 'MODO SIMULACIÓN (DEV)';
  });

  private ws: WebSocket | null = null;
  private serialReader: any = null;
  private serialPort: any = null;
  private simInterval: ReturnType<typeof setInterval> | null = null;
  private baseSimulatedWeight = 24520;

  constructor(private http: HttpClient) {
    this.inicializarLecturaPeso();
  }

  ngOnDestroy(): void {
    this.detenerConexiones();
  }

  // ============================================================
  // Endpoints REST de Operación de Báscula
  // ============================================================

  getEntradasActivas(): Observable<EntradaBascula[]> {
    return this.http.get<EntradaBascula[]>(`${this.API_URL}/entrada/activos/lista`);
  }

  registrarEntrada(entrada: CrearEntrada): Observable<{ message: string; id?: number }> {
    return this.http.post<{ message: string; id?: number }>(`${this.API_URL}/entrada`, entrada);
  }

  registrarSalida(salida: CrearSalida): Observable<SalidaResponse> {
    return this.http.post<SalidaResponse>(`${this.API_URL}/salida`, salida);
  }

  /**
   * Anula / cancela una entrada activa en patio.
   * Libera el `codigoEntrada` según el trigger `validar_codigoEntrada_activo`.
   */
  cancelarEntrada(id: number, motivo: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/entrada/${id}/cancelar`, {
      motivo,
      motivo_cancelacion: motivo,
    });
  }

  getHistorialCompleto(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.API_URL}/transacciones`);
  }

  // ============================================================
  // Integración de Hardware: WebSocket / Web Serial API / Fallback
  // ============================================================

  inicializarLecturaPeso(): void {
    // Intentar conexión por WebSocket local si está configurado; si falla, cae a simulación.
    if (environment.scaleWsUrl) {
      this.conectarWebSocket(environment.scaleWsUrl, environment.scaleSimulationFallback);
    } else if (environment.scaleSimulationFallback) {
      this.activarModoSimulacion();
    }
  }

  /**
   * Conecta a un puente local de báscula vía WebSocket.
   * Si no hay servidor WS activo y `fallbackToSim` es true, activa el modo simulación.
   */
  conectarWebSocket(url: string, fallbackToSim = true): void {
    try {
      this.detenerSimulacion();
      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this._modoConexion.set('websocket');
        this._hardwareConectado.set(true);
      };

      this.ws.onmessage = (event) => {
        this.procesarTramaPeso(event.data);
      };

      this.ws.onerror = () => {
        if (fallbackToSim && this._modoConexion() !== 'serial') {
          this.activarModoSimulacion();
        }
      };

      this.ws.onclose = () => {
        if (this._modoConexion() === 'websocket') {
          this._hardwareConectado.set(false);
          if (fallbackToSim) {
            this.activarModoSimulacion();
          }
        }
      };
    } catch {
      if (fallbackToSim) {
        this.activarModoSimulacion();
      }
    }
  }

  /**
   * Conecta directamente al indicador físico de la báscula mediante Web Serial API (Chrome/Edge).
   */
  async conectarPuertoSerial(baudRate = 9600): Promise<boolean> {
    const nav = navigator as any;
    if (!nav?.serial) {
      throw new Error('Este navegador no soporta Web Serial API (usa Chrome o Edge).');
    }

    try {
      this.serialPort = await nav.serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.detenerSimulacion();
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this._modoConexion.set('serial');
      this._hardwareConectado.set(true);

      const textDecoder = new TextDecoderStream();
      this.serialPort.readable.pipeTo(textDecoder.writable);
      this.serialReader = textDecoder.readable.getReader();

      this.leerBucleSerial();
      return true;
    } catch (err) {
      if (environment.scaleSimulationFallback && this._modoConexion() !== 'serial') {
        this.activarModoSimulacion();
      }
      throw err;
    }
  }

  private async leerBucleSerial(): Promise<void> {
    let buffer = '';
    try {
      while (this.serialReader) {
        const { value, done } = await this.serialReader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';
          for (const line of lines) {
            this.procesarTramaPeso(line);
          }
        }
      }
    } catch {
      this._hardwareConectado.set(false);
      if (environment.scaleSimulationFallback) {
        this.activarModoSimulacion();
      }
    }
  }

  /**
   * Interpreta tramas JSON (`{"weight": 24500, "stable": true}`) o tramas ASCII
   * estándar de indicadores industriales (ej. `ST,GS,+024500kg` o `24500`).
   */
  private procesarTramaPeso(raw: any): void {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          const w = Number(parsed.weight ?? parsed.peso);
          if (Number.isFinite(w)) {
            this._pesoActual.set(Math.max(0, Math.round(w)));
            this._estable.set(parsed.stable ?? parsed.estable ?? true);
          }
          return;
        } catch {
          // Continúa con parseo ASCII
        }
      }

      const isUnstable = /US|MOTION/i.test(trimmed);
      const match = trimmed.match(/[-+]?\d+(\.\d+)?/);
      if (match) {
        const val = Number(match[0]);
        if (Number.isFinite(val)) {
          this._pesoActual.set(Math.max(0, Math.round(val)));
          this._estable.set(!isUnstable);
        }
      }
    }
  }

  /**
   * Activa el modo de simulación de desarrollo cuando no hay báscula física conectada.
   */
  activarModoSimulacion(pesoInicial = 24520): void {
    this.detenerSimulacion();
    this._modoConexion.set('simulacion');
    this._hardwareConectado.set(false);
    this.baseSimulatedWeight = pesoInicial;
    this._pesoActual.set(this.baseSimulatedWeight);
    this._estable.set(true);

    // Simula micro-variaciones realistas de celda de carga (±10 kg ocasionales) si el peso > 0
    this.simInterval = setInterval(() => {
      if (this._modoConexion() !== 'simulacion') return;
      if (this.baseSimulatedWeight <= 0) {
        this._pesoActual.set(0);
        this._estable.set(true);
        return;
      }
      const jitter = Math.random() > 0.82 ? (Math.random() > 0.5 ? 10 : -10) : 0;
      this._estable.set(jitter === 0);
      this._pesoActual.set(Math.max(0, this.baseSimulatedWeight + jitter));
    }, 2500);
  }

  /**
   * Permite fijar manualmente un peso en modo simulación (ej. Puesta a Cero o simular camión cargado/vacío).
   */
  fijarPesoSimulado(peso: number): void {
    this.baseSimulatedWeight = Math.max(0, Math.round(peso));
    this._pesoActual.set(this.baseSimulatedWeight);
    this._estable.set(true);
  }

  private detenerSimulacion(): void {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  private detenerConexiones(): void {
    this.detenerSimulacion();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.serialReader) {
      try {
        this.serialReader.cancel();
      } catch {}
      this.serialReader = null;
    }
  }

  // ============================================================
  // Impresión Térmica de Tickets (Formato 80mm)
  // ============================================================

  imprimirTicketTermico(ticket: TicketImpresion): void {
    this._ticketActual.set(ticket);
    // Esperamos al siguiente ciclo de renderizado para que la vista @media print tenga los datos actualizados
    setTimeout(() => {
      window.print();
    }, 120);
  }
}
