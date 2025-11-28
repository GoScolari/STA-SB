/**
 * Middleware de Validación
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware para validar resultados de express-validator
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validación fallida', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Sanitiza y normaliza datos de entrada
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const sanitizeData = (req, res, next) => {
  // Trim strings en body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Trim strings en query
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

/**
 * Valida que los IDs sean números enteros positivos
 * @param {string} paramName - Nombre del parámetro
 * @returns {Function}
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName]);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: `El parámetro '${paramName}' debe ser un número entero positivo`
      });
    }

    req.params[paramName] = id;
    next();
  };
};

/**
 * Valida rango de fechas
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const validateDateRange = (req, res, next) => {
  const { fechaInicio, fechaFin } = req.query;

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de inicio inválida'
      });
    }

    if (isNaN(fin.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de fin inválida'
      });
    }

    if (inicio > fin) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }
  }

  next();
};

/**
 * Valida paginación
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'El número de página debe ser mayor a 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'El límite debe estar entre 1 y 100'
    });
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
};

module.exports = {
  validate,
  sanitizeData,
  validateId,
  validateDateRange,
  validatePagination
};
