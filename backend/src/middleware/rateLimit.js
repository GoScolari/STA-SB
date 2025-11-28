/**
 * Middleware de Rate Limiting
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * Rate limiter general para APIs
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('Rate limit excedido', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes, por favor intente más tarde'
    });
  }
});

/**
 * Rate limiter estricto para login
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión, cuenta bloqueada temporalmente'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.security('Login rate limit excedido', {
      ip: req.ip,
      email: req.body?.email
    });

    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos'
    });
  }
});

/**
 * Rate limiter para creación de recursos
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de creación, por favor intente más tarde'
  }
});

/**
 * Rate limiter para exportación de datos
 */
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    message: 'Límite de exportaciones alcanzado, intente más tarde'
  }
});

module.exports = {
  apiLimiter,
  loginLimiter,
  createLimiter,
  exportLimiter
};
