/**
 * Rutas de Estaciones
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const estacionesController = require('../controllers/estacionesController');
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');
const { PERMISOS } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validator');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /api/estaciones:
 *   get:
 *     tags: [Estaciones]
 *     summary: Obtener todas las estaciones de telemetría
 *     description: Retorna la lista completa de las 30 estaciones del sistema STA-SB
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de estación
 *     responses:
 *       200:
 *         description: Lista de estaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estaciones obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Estacion'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/',
  requirePermission(PERMISOS.VER_ESTACIONES),
  [
    query('activo').optional().isBoolean(),
    query('tipo').optional().trim()
  ],
  validate,
  estacionesController.getEstaciones
);

/**
 * @swagger
 * /api/estaciones/estadisticas:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener estadísticas generales del sistema
 *     description: Retorna estadísticas consolidadas de todas las estaciones para reportes DGA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     activas:
 *                       type: integer
 *                       example: 28
 *                     por_tipo:
 *                       type: object
 *                       properties:
 *                         primaria:
 *                           type: integer
 *                         secundaria:
 *                           type: integer
 *                         terciaria:
 *                           type: integer
 *                         control:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/estadisticas',
  requirePermission(PERMISOS.VER_ESTADISTICAS),
  estacionesController.getEstadisticasGenerales
);

/**
 * @route   GET /api/estaciones/:id
 * @desc    Obtener estación por ID
 * @access  Private (requiere permiso VER_ESTACIONES)
 */
router.get(
  '/:id',
  requirePermission(PERMISOS.VER_ESTACIONES),
  validateId(),
  estacionesController.getEstacion
);

/**
 * @route   POST /api/estaciones
 * @desc    Crear nueva estación
 * @access  Private (requiere permiso CREAR_ESTACION)
 */
router.post(
  '/',
  requirePermission(PERMISOS.CREAR_ESTACION),
  [
    body('codigo')
      .trim()
      .notEmpty()
      .withMessage('Código requerido')
      .isLength({ max: 20 })
      .withMessage('Código máximo 20 caracteres'),
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('Nombre requerido')
      .isLength({ max: 100 })
      .withMessage('Nombre máximo 100 caracteres'),
    body('descripcion').optional().trim(),
    body('latitud').optional().isFloat({ min: -90, max: 90 }),
    body('longitud').optional().isFloat({ min: -180, max: 180 }),
    body('tipo_estacion').optional().trim(),
    body('estado').optional().isBoolean()
  ],
  validate,
  estacionesController.createEstacion
);

/**
 * @route   PUT /api/estaciones/:id
 * @desc    Actualizar estación
 * @access  Private (requiere permiso EDITAR_ESTACION)
 */
router.put(
  '/:id',
  requirePermission(PERMISOS.EDITAR_ESTACION),
  validateId(),
  [
    body('nombre').optional().trim().notEmpty(),
    body('descripcion').optional().trim(),
    body('latitud').optional().isFloat({ min: -90, max: 90 }),
    body('longitud').optional().isFloat({ min: -180, max: 180 }),
    body('tipo_estacion').optional().trim(),
    body('estado').optional().isBoolean()
  ],
  validate,
  estacionesController.updateEstacion
);

/**
 * @route   DELETE /api/estaciones/:id
 * @desc    Eliminar estación
 * @access  Private (requiere permiso ELIMINAR_ESTACION)
 */
router.delete(
  '/:id',
  requirePermission(PERMISOS.ELIMINAR_ESTACION),
  validateId(),
  estacionesController.deleteEstacion
);

/**
 * @route   GET /api/estaciones/:id/datos
 * @desc    Obtener datos de sensores de una estación
 * @access  Private (requiere permiso VER_ESTACIONES)
 */
router.get(
  '/:id/datos',
  requirePermission(PERMISOS.VER_ESTACIONES),
  validateId(),
  [
    query('tipoSensor').optional().trim(),
    query('rango').optional().trim()
  ],
  validate,
  estacionesController.getDatosEstacion
);

/**
 * @swagger
 * /api/estaciones/{id}/estadisticas:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener estadísticas de una estación específica
 *     description: Retorna datos estadísticos y métricas de una estación para análisis detallado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la estación
 *       - in: query
 *         name: rango
 *         schema:
 *           type: string
 *           enum: ['-1h', '-24h', '-7d', '-30d', '-1y']
 *           default: '-24h'
 *         description: Rango temporal para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de estación obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     estacion:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         codigo:
 *                           type: string
 *                         nombre:
 *                           type: string
 *                     rango:
 *                       type: string
 *                       example: "-24h"
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         caudal_promedio:
 *                           type: number
 *                         nivel_maximo:
 *                           type: number
 *                         temperatura_media:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/:id/estadisticas',
  requirePermission(PERMISOS.VER_ESTADISTICAS),
  validateId(),
  [
    query('rango').optional().trim()
  ],
  validate,
  estacionesController.getEstadisticasEstacion
);

module.exports = router;
