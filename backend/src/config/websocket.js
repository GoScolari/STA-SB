/**
 * Configuración WebSocket con Socket.IO
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 *
 * Maneja conexiones Socket.IO para envío de datos en tiempo real al frontend
 */

const { Server } = require('socket.io');
const logger = require('./logger');
const { verifyToken } = require('../middleware/auth');

let io = null;

/**
 * Inicializar servidor Socket.IO
 */
function inicializar(server) {
  io = new Server(server, {
    path: '/ws/socket.io',
    cors: {
      origin: process.env.WS_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      logger.warn('Socket.IO: Intento de conexión sin token');
      return next(new Error('No autorizado'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.warn('Socket.IO: Token inválido', { error: error.message });
      return next(new Error('Token inválido'));
    }
  });

  // Manejar conexiones
  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info('Socket.IO: Nueva conexión', {
      socketId: socket.id,
      usuario: user.email,
      rol: user.rol
    });

    // Enviar mensaje de bienvenida
    socket.emit('connected', {
      message: 'Conexión Socket.IO establecida',
      timestamp: new Date().toISOString(),
      usuario: {
        id: user.id,
        email: user.email,
        rol: user.rol
      }
    });

    // Suscribirse a estaciones específicas
    socket.on('subscribe', (data) => {
      const estaciones = data.estaciones || data || [];

      if (Array.isArray(estaciones) && estaciones.length > 0) {
        // Guardar las estaciones suscritas en el socket
        socket.estacionesSubscritas = estaciones;

        logger.info('Socket.IO: Cliente suscrito a estaciones', {
          socketId: socket.id,
          usuario: user.email,
          estaciones: estaciones
        });

        socket.emit('subscribed', {
          estaciones: estaciones,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Desuscribirse
    socket.on('unsubscribe', (data) => {
      const estaciones = data.estaciones || data || [];

      if (socket.estacionesSubscritas) {
        socket.estacionesSubscritas = socket.estacionesSubscritas.filter(
          e => !estaciones.includes(e)
        );
      }

      logger.info('Socket.IO: Cliente desuscrito de estaciones', {
        socketId: socket.id,
        usuario: user.email,
        estaciones: estaciones
      });
    });

    // Ping/Pong para mantener conexión viva
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString()
      });
    });

    // Manejar desconexión
    socket.on('disconnect', (reason) => {
      logger.info('Socket.IO: Cliente desconectado', {
        socketId: socket.id,
        usuario: user.email,
        reason: reason
      });
    });

    // Manejar errores
    socket.on('error', (error) => {
      logger.error('Socket.IO: Error de socket', {
        socketId: socket.id,
        usuario: user.email,
        error: error.message
      });
    });
  });

  logger.info('✅ Servidor Socket.IO inicializado en /ws');
  logger.info(`🔌 WebSocket: ✅ Inicializado en ws://localhost:${process.env.PORT || 5000}/ws`);

  return io;
}

/**
 * Broadcast de datos a todos los clientes conectados o a clientes específicos
 */
function broadcast(event, data) {
  if (!io) {
    logger.warn('Socket.IO: Intento de broadcast sin servidor inicializado');
    return;
  }

  // Si los datos incluyen estacion_id, enviar solo a clientes suscritos
  if (data && data.estacion_id) {
    const estacionId = data.estacion_id;
    let clientesEnviados = 0;

    io.sockets.sockets.forEach((socket) => {
      if (socket.estacionesSubscritas && socket.estacionesSubscritas.includes(estacionId)) {
        socket.emit(event, {
          type: event,
          data: data,
          timestamp: new Date().toISOString()
        });
        clientesEnviados++;
      }
    });

    if (clientesEnviados > 0) {
      logger.debug(`Socket.IO: Broadcast ${event} a ${clientesEnviados} clientes para estación ${estacionId}`);
    }
  } else {
    // Broadcast a todos
    const totalClientes = io.sockets.sockets.size;
    io.emit(event, {
      type: event,
      data: data,
      timestamp: new Date().toISOString()
    });

    if (totalClientes > 0) {
      logger.debug(`Socket.IO: Broadcast ${event} a ${totalClientes} clientes`);
    }
  }
}

/**
 * Obtener el servidor Socket.IO
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
}

/**
 * Obtener estadísticas de conexiones
 */
function getStats() {
  if (!io) {
    return {
      conectados: 0,
      sockets: []
    };
  }

  const sockets = [];
  io.sockets.sockets.forEach((socket) => {
    sockets.push({
      id: socket.id,
      usuario: socket.user ? socket.user.email : 'desconocido',
      estaciones: socket.estacionesSubscritas || [],
      conectado: socket.connected
    });
  });

  return {
    conectados: io.sockets.sockets.size,
    sockets: sockets
  };
}

/**
 * Cerrar servidor Socket.IO
 */
function cerrar() {
  if (io) {
    logger.info('Cerrando servidor Socket.IO...');
    io.close();
    io = null;
  }
}

module.exports = {
  inicializar,
  broadcast,
  getIO,
  getStats,
  cerrar
};
