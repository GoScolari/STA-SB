/**
 * Rutas de Sensores y Telemetría
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const sensoresController = require('../controllers/sensoresController');

/**
 * @swagger
 * tags:
 *   name: Sensores
 *   description: Endpoints para gestión de datos de sensores y telemetría
 */

/**
 * @swagger
 * /api/sensores/datos/{estacionId}:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtener datos históricos de sensores de una estación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Cantidad de registros a retornar
 *       - in: query
 *         name: sensor
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de sensor
 *     responses:
 *       200:
 *         description: Datos de sensores obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/datos/:estacionId', authenticateToken, sensoresController.obtenerDatosEstacion);

/**
 * @swagger
 * /api/sensores/tiempo-real/{estacionId}:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtener últimos valores de todos los sensores (tiempo real)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estación
 *     responses:
 *       200:
 *         description: Datos en tiempo real obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/tiempo-real/:estacionId', authenticateToken, sensoresController.obtenerDatosTiempoReal);

/**
 * @swagger
 * /api/sensores/estadisticas/{estacionId}:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtener estadísticas agregadas de un sensor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estación
 *       - in: query
 *         name: sensor
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de sensor
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           default: "1h"
 *         description: Período de análisis (1h, 24h, 7d, etc)
 *     responses:
 *       200:
 *         description: Estadísticas calculadas exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas/:estacionId', authenticateToken, sensoresController.obtenerEstadisticas);

/**
 * @swagger
 * /api/sensores/heartbeat/{estacionId}:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtener estado de conexión de una estación (heartbeat)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estación
 *     responses:
 *       200:
 *         description: Heartbeat obtenido exitosamente
 *       404:
 *         description: Estación no encontrada o sin heartbeat reciente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/heartbeat/:estacionId', authenticateToken, sensoresController.obtenerHeartbeat);

/**
 * @swagger
 * /api/sensores/comando/{estacionId}:
 *   post:
 *     tags: [Sensores]
 *     summary: Enviar comando a dispositivo de una estación (compuerta, bomba)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la estación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dispositivo
 *               - comando
 *             properties:
 *               dispositivo:
 *                 type: string
 *                 example: "compuerta"
 *               comando:
 *                 type: string
 *                 example: "abrir"
 *               parametros:
 *                 type: object
 *                 example: { "porcentaje": 50 }
 *     responses:
 *       200:
 *         description: Comando enviado exitosamente
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos para enviar comandos
 *       500:
 *         description: Error del servidor
 */
router.post('/comando/:estacionId', authenticateToken, sensoresController.enviarComando);

/**
 * @swagger
 * /api/sensores/mqtt/stats:
 *   get:
 *     tags: [Sensores]
 *     summary: Obtener estadísticas del servicio MQTT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas MQTT obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/mqtt/stats', authenticateToken, sensoresController.obtenerEstadisticasMQTT);

module.exports = router;
