/**
 * Enrutador Principal
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const estacionesRoutes = require('./estaciones');
const sensoresRoutes = require('./sensores');

/**
 * @route   GET /api
 * @desc    Endpoint de salud del API
 * @access  Public
 */
/**
 * @swagger
 * /api:
 *   get:
 *     tags: [Sistema]
 *     summary: Información general de la API
 *     description: Retorna información básica sobre la API y endpoints disponibles
 *     responses:
 *       200:
 *         description: Información del sistema
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
 *                   example: "API Sistema de Telemetría y Automatización San Javier"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema de Telemetría y Automatización San Javier',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/health
 * @desc    Health check del servidor
 * @access  Public
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Sistema]
 *     summary: Verificar estado del servidor
 *     description: Retorna el estado de salud del servidor, memoria y tiempo de actividad
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/estaciones', estacionesRoutes);
router.use('/sensores', sensoresRoutes);

module.exports = router;
