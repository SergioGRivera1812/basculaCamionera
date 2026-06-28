export interface Usuario {
  id?: number;
  nombre: string;
  usuario: string;
  password?: string;
  rol: 'admin' | 'operador';
  creado_en?: string;
}

export interface Chofer {
  id?: number;
  nombre: string;
  telefono?: string;
  creado_en?: string;
}

export interface Material {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Cliente { // Representa a la tabla proveedores
  id?: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
}

export interface EntradaBascula {
  id?: number;
  codigoEntrada: number;
  nombre_chofer: string;
  id_material: number;
  cliente: string; 
  tara: number;
  fecha_entrada?: string;
  activo: number;
}

export interface SalidaBascula {
  id?: number;
  codigoEntrada: number;
  bruto: number;
  neto: number;
  fecha_salida?: string;
  activo: number;
}

/** Body de POST /api/entrada (el backend fija `activo = 1`). */
export interface CrearEntrada {
  codigoEntrada: number;
  nombre_chofer: string;
  id_material: number;
  cliente: string;
  tara: number;
}

/** Body de POST /api/salida. El backend calcula el `neto` y cierra la entrada. */
export interface CrearSalida {
  codigoEntrada: number;
  bruto: number;
}

/** Respuesta de POST /api/salida: el backend devuelve el neto calculado. */
export interface SalidaResponse {
  message: string;
  neto: number;
}

/** Fila del historial de transacciones que devuelve el backend (/transacciones). */
export interface Transaccion {
  id?: number;
  folio: number;
  codigoEntrada?: number;
  cliente: string;
  chofer: string;
  placa?: string;
  id_material?: number;
  tara: number;
  bruto?: number;
  neto?: number;
  fecha?: string;
  estado: 'completado' | 'pendiente';
}
