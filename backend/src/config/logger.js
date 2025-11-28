/**
 * Configuración de Winston Logger
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Niveles de logging
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.splat !== undefined ? `${JSON.stringify(info.splat)}` : "")
  )
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Directorio de logs
const logDir = process.env.LOG_DIR || 'logs';

// Transports
const transports = [
  // Logs de consola
  new winston.transports.Console({
    format: format,
  }),

  // Logs de errores (rotación diaria)
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  }),

  // Logs combinados (rotación diaria)
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  }),

  // Logs de auditoría (retención 7 años según normativa DGA)
  new DailyRotateFile({
    filename: path.join(logDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '2557d', // 7 años
    zippedArchive: true,
  }),
];

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,
});

/**
 * Logger de auditoría para acciones del sistema
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción realizada
 * @param {Object} details - Detalles adicionales
 */
logger.audit = (userId, action, details = {}) => {
  logger.info('AUDIT', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    type: 'audit'
  });
};

/**
 * Logger de seguridad
 * @param {string} event - Evento de seguridad
 * @param {Object} details - Detalles
 */
logger.security = (event, details = {}) => {
  logger.warn('SECURITY', {
    event,
    details,
    timestamp: new Date().toISOString(),
    type: 'security'
  });
};

module.exports = logger;
