/**
 * Rutas de Autenticación
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { loginLimiter } = require('../middleware/rateLimit');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y obtener token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@ouasanjavier.cl"
 *             password: "Admin123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password requerido')
  ],
  validate,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout de usuario
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna información completa del usuario logueado con sus permisos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Usuario'
 *                     - type: object
 *                       properties:
 *                         permisos:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["crear_estacion", "editar_estacion", "ver_estaciones"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil del usuario autenticado
 *     description: Permite al usuario actualizar su información personal y contraseña
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del usuario
 *                 example: "Juan Carlos"
 *               apellido:
 *                 type: string
 *                 description: Nuevo apellido del usuario
 *                 example: "González"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *                 example: "NuevaPass123!"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *                   example: "Perfil actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/profile',
  authenticateToken,
  [
    body('nombre').optional().trim().notEmpty(),
    body('apellido').optional().trim().notEmpty(),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password debe tener al menos 8 caracteres')
  ],
  validate,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar access token
 * @access  Public
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token requerido')
  ],
  validate,
  authController.refreshToken
);

module.exports = router;
