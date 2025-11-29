/**
 * Servidor Principal
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const logger = require('./config/logger');
const db = require('./config/database');
const influx = require('./config/influx');
const mqtt = require('./config/mqtt');
const websocket = require('./config/websocket');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const { sanitizeData } = require('./middleware/validator');

const { swaggerUi, specs, swaggerOptions } = require('./config/swagger');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

/**
 * MIDDLEWARE DE SEGURIDAD
 */

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/**
 * SWAGGER DOCUMENTATION
 */
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, swaggerOptions));

// Redirect /docs to /api-docs for convenience
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

/**
 * MIDDLEWARE GENERAL
 */

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan para logging de requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// Sanitización de datos
app.use(sanitizeData);

// Rate limiting global
app.use('/api/', apiLimiter);

/**
 * RUTAS
 */

// API Routes
app.use('/api', routes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

/**
 * MANEJO DE ERRORES
 */

app.use((err, req, res, next) => {
  logger.error('Error no manejado:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * INICIALIZACIÓN DEL SERVIDOR
 */

const startServer = async () => {
  try {
    // Verificar conexión a PostgreSQL
    const pgConnected = await db.testConnection();
    if (!pgConnected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }

    // Verificar conexión a InfluxDB
    const influxConnected = await influx.testConnection();
    if (!influxConnected) {
      logger.warn('No se pudo conectar a InfluxDB - Continuando sin series temporales');
    }

    // Iniciar servidor HTTP
    const server = app.listen(PORT, HOST, async () => {
      logger.info('='.repeat(60));
      logger.info('🚀 Servidor STA-SB iniciado correctamente');
      logger.info(`📍 URL: http://${HOST}:${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 PostgreSQL: ✅ Conectado`);
      logger.info(`📈 InfluxDB: ${influxConnected ? '✅' : '⚠️'} ${influxConnected ? 'Conectado' : 'No disponible'}`);

      // Inicializar WebSocket
      try {
        websocket.inicializar(server);
        logger.info(`🔌 WebSocket: ✅ Inicializado en ws://${HOST}:${PORT}/ws`);

        // Conectar a broker MQTT
        try {
          await mqtt.conectar();
          // Pasar el módulo websocket completo (no solo el servidor io)
          mqtt.registrarWebSocket(websocket);
          logger.info('📡 MQTT: ✅ Conectado y listo para recibir datos');
        } catch (mqttError) {
          logger.warn('⚠️  MQTT: No disponible -', mqttError.message);
          logger.warn('   El sistema funcionará sin datos en tiempo real desde estaciones');
        }

      } catch (wsError) {
        logger.error('❌ Error inicializando WebSocket:', wsError.message);
      }

      logger.info('='.repeat(60));
      logger.info('📚 Documentación Swagger: http://' + HOST + ':' + PORT + '/api-docs');
      logger.info('='.repeat(60));
    });

    return server;

  } catch (error) {
    logger.error('Error fatal al iniciar servidor:', error.message);
    process.exit(1);
  }
};

/**
 * MANEJO DE SEÑALES DEL SISTEMA
 */

const gracefulShutdown = async (signal) => {
  logger.info(`\n📴 Señal ${signal} recibida. Cerrando servidor...`);

  try {
    // Cerrar conexiones MQTT y WebSocket
    await mqtt.desconectar();
    websocket.cerrar();

    // Cerrar conexiones de base de datos
    await db.closePool();
    await influx.close();

    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  } catch (error) {
    logger.error('Error cerrando servidor:', error.message);
    process.exit(1);
  }
};

// Escuchar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rechazada no manejada:', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

// Iniciar servidor
startServer();

module.exports = app;
