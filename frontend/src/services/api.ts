/**
 * Cliente API para comunicación con backend
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Usuario,
  LoginCredentials,
  AuthResponse,
  Estacion,
  DatoSensor,
  SensoresEstacion,
  Estadisticas,
  Heartbeat,
  ComandoEstacion,
  ApiResponse
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticación
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    if (data.success && data.data.accessToken) {
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
      localStorage.setItem('permisos', JSON.stringify(data.data.permisos));
    }
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  async obtenerPerfil(): Promise<Usuario> {
    const { data } = await this.client.get<ApiResponse<Usuario>>('/auth/perfil');
    return data.data!;
  }

  // Estaciones
  async obtenerEstaciones(): Promise<Estacion[]> {
    const { data } = await this.client.get<ApiResponse<Estacion[]>>('/estaciones');
    return data.data || [];
  }

  async obtenerEstacion(id: string): Promise<Estacion> {
    const { data } = await this.client.get<ApiResponse<Estacion>>(`/estaciones/${id}`);
    return data.data!;
  }

  async crearEstacion(estacion: Partial<Estacion>): Promise<Estacion> {
    const { data } = await this.client.post<ApiResponse<Estacion>>('/estaciones', estacion);
    return data.data!;
  }

  async actualizarEstacion(id: string, estacion: Partial<Estacion>): Promise<Estacion> {
    const { data } = await this.client.put<ApiResponse<Estacion>>(`/estaciones/${id}`, estacion);
    return data.data!;
  }

  async eliminarEstacion(id: string): Promise<void> {
    await this.client.delete(`/estaciones/${id}`);
  }

  // Sensores y Datos
  async obtenerDatosEstacion(estacionId: string, params?: { limit?: number; sensor?: string }): Promise<DatoSensor[]> {
    const { data } = await this.client.get<ApiResponse>(`/sensores/datos/${estacionId}`, { params });
    return data.datos || [];
  }

  async obtenerDatosTiempoReal(estacionId: string): Promise<SensoresEstacion> {
    const { data } = await this.client.get<ApiResponse<SensoresEstacion>>(`/sensores/tiempo-real/${estacionId}`);
    return data as any;
  }

  async obtenerEstadisticas(estacionId: string, sensor: string, periodo: string = '1h'): Promise<Estadisticas> {
    const { data } = await this.client.get<ApiResponse>(`/sensores/estadisticas/${estacionId}`, {
      params: { sensor, periodo }
    });
    return data.estadisticas;
  }

  async obtenerHeartbeat(estacionId: string): Promise<Heartbeat> {
    const { data } = await this.client.get<ApiResponse>(`/sensores/heartbeat/${estacionId}`);
    return data.heartbeat;
  }

  async enviarComando(estacionId: string, comando: ComandoEstacion): Promise<void> {
    await this.client.post(`/sensores/comando/${estacionId}`, comando);
  }

  async obtenerEstadisticasMQTT(): Promise<any> {
    const { data } = await this.client.get<ApiResponse>('/sensores/mqtt/stats');
    return data.mqtt;
  }

  // Usuarios (solo admin)
  async obtenerUsuarios(): Promise<Usuario[]> {
    const { data } = await this.client.get<ApiResponse<Usuario[]>>('/auth/usuarios');
    return data.data || [];
  }

  async crearUsuario(usuario: Partial<Usuario> & { password: string }): Promise<Usuario> {
    const { data } = await this.client.post<ApiResponse<Usuario>>('/auth/registro', usuario);
    return data.data!;
  }

  async actualizarUsuario(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await this.client.put<ApiResponse<Usuario>>(`/auth/usuarios/${id}`, usuario);
    return data.data!;
  }

  async eliminarUsuario(id: string): Promise<void> {
    await this.client.delete(`/auth/usuarios/${id}`);
  }

  // Health
  async healthCheck(): Promise<any> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

export const api = new ApiClient();
export default api;
