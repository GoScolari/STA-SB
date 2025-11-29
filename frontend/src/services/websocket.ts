/**
 * Cliente WebSocket para datos en tiempo real
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import { io, Socket } from 'socket.io-client';
import type { WebSocketMessage } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket ya está conectado');
      return;
    }

    this.socket = io(WS_URL, {
      path: '/ws/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket desconectado:', reason);
      this.emit('disconnected', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de intentos de reconexión alcanzado');
        this.socket?.close();
      }
    });

    // Escuchar mensajes del servidor
    this.socket.on('message', (message: WebSocketMessage) => {
      this.handleMessage(message);
    });

    // Escuchar datos de sensores
    this.socket.on('sensor_data', (data: any) => {
      this.emit('sensor_data', data);
    });

    // Escuchar estado de actuadores
    this.socket.on('actuator_status', (data: any) => {
      this.emit('actuator_status', data);
    });

    // Escuchar alertas
    this.socket.on('alert', (data: any) => {
      this.emit('alert', data);
    });

    // Responder a pings
    this.socket.on('ping', () => {
      this.send('pong', {});
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket desconectado manualmente');
    }
  }

  send(type: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(type, data);
    } else {
      console.warn('WebSocket no está conectado. Mensaje no enviado:', type);
    }
  }

  subscribe(estaciones: string[]): void {
    this.send('subscribe', { estaciones });
  }

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Retornar función para desuscribirse
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en callback de evento ${event}:`, error);
        }
      });
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'sensor_data':
        this.emit('sensor_data', message.data);
        break;
      case 'actuator_status':
        this.emit('actuator_status', message.data);
        break;
      case 'alert':
        this.emit('alert', message.data);
        break;
      case 'connected':
        this.emit('connected', message);
        break;
      default:
        console.log('Mensaje WebSocket no manejado:', message);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocket = new WebSocketClient();
export default websocket;
