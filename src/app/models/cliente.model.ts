export interface Cliente {
  id?: number;
  nombre: string;
  rfc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  fecha_registro?: string;
  status?: 'activo' | 'inactivo';
}
