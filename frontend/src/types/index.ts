/**
 * Tipos y definiciones TypeScript
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

// Usuario y Autenticación
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'administrador' | 'operador' | 'visualizador';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    usuario: Usuario;
    accessToken: string;
    refreshToken: string;
    permisos: string[];
  };
}

// Estación
export interface Estacion {
  id: string;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  tipo: 'primaria' | 'secundaria' | 'terciaria' | 'control' | 'bombeo' | 'derivacion' | 'medicion' | 'regulatorio' | 'bocatoma';
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  ultimaConexion?: string;
  createdAt: string;
  updatedAt: string;
}

// Sensor
export interface DatoSensor {
  tiempo: string;
  estacion: string;
  sensor: 'nivel_agua' | 'temperatura' | 'caudal' | 'presion';
  valor: number;
  unidad: string;
  calidad: 'excelente' | 'buena' | 'regular' | 'mala';
}

export interface SensorTiempoReal {
  valor: number;
  unidad: string;
  calidad: string;
  tiempo: string;
}

export interface SensoresEstacion {
  estacion_id: string;
  sensores: {
    nivel_agua?: SensorTiempoReal;
    temperatura?: SensorTiempoReal;
    caudal?: SensorTiempoReal;
    presion?: SensorTiempoReal;
  };
  timestamp: string;
}

// Estadísticas
export interface Estadisticas {
  total: number;
  minimo: number;
  maximo: number;
  promedio: number;
  desviacion: number;
}

// Heartbeat
export interface Heartbeat {
  estacion_id: string;
  estado: string;
  uptime: number;
  tiempo: string;
  online: boolean;
  minutos_desde_heartbeat: number;
}

// Comando
export interface ComandoEstacion {
  dispositivo: 'compuerta' | 'bomba';
  comando: string;
  parametros?: Record<string, any>;
}

// Reporte
export interface ConfiguracionReporte {
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  formato: 'pdf' | 'excel';
  estaciones: string[];
  fechaInicio?: string;
  fechaFin?: string;
  incluirGraficos: boolean;
}

// WebSocket
export interface WebSocketMessage {
  type: 'sensor_data' | 'actuator_status' | 'alert' | 'connected' | 'ping' | 'pong';
  topic?: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

// UI
export interface Alerta {
  id: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
  mensaje: string;
  timestamp: string;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
