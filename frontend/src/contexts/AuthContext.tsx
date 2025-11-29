/**
 * Contexto de Autenticación
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { websocket } from '@/services/websocket';
import type { Usuario, LoginCredentials } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (token && usuarioGuardado) {
      try {
        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);

        // Conectar WebSocket
        websocket.connect(token);

        // Verificar que el token siga válido
        api.obtenerPerfil()
          .then(perfil => {
            setUsuario(perfil);
            localStorage.setItem('usuario', JSON.stringify(perfil));
          })
          .catch(() => {
            // Token inválido
            logout();
          });
      } catch (error) {
        console.error('Error restaurando sesión:', error);
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);

      if (response.success && response.data.usuario) {
        setUsuario(response.data.usuario);

        // Conectar WebSocket
        websocket.connect(response.data.accessToken);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    api.logout();
    websocket.disconnect();
  };

  const actualizarUsuario = (usuarioActualizado: Usuario) => {
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
    actualizarUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
