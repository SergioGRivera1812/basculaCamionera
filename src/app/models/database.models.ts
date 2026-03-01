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
