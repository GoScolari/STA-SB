/**
 * Middleware de Autenticación y Autorización
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Roles y permisos del sistema RBAC
 */
const ROLES = {
  ADMINISTRADOR: 'administrador',
  OPERADOR: 'operador',
  VISUALIZADOR: 'visualizador'
};

const PERMISOS = {
  // Estaciones
  CREAR_ESTACION: 'crear_estacion',
  EDITAR_ESTACION: 'editar_estacion',
  ELIMINAR_ESTACION: 'eliminar_estacion',
  VER_ESTACIONES: 'ver_estaciones',

  // Control
  CONTROLAR_COMPUERTAS: 'controlar_compuertas',
  CONTROLAR_BOMBAS: 'controlar_bombas',

  // Usuarios
  CREAR_USUARIO: 'crear_usuario',
  EDITAR_USUARIO: 'editar_usuario',
  ELIMINAR_USUARIO: 'eliminar_usuario',
  VER_USUARIOS: 'ver_usuarios',

  // Reportes
  GENERAR_REPORTES: 'generar_reportes',
  EXPORTAR_DATOS: 'exportar_datos',
  VER_ESTADISTICAS: 'ver_estadisticas',

  // Sistema
  MODIFICAR_CONFIGURACION: 'modificar_configuracion',
  VER_LOGS_AUDITORIA: 'ver_logs_auditoria',
  GESTIONAR_RESPALDOS: 'gestionar_respaldos'
};

/**
 * Matriz de permisos por rol
 */
const PERMISOS_POR_ROL = {
  [ROLES.ADMINISTRADOR]: Object.values(PERMISOS),

  [ROLES.OPERADOR]: [
    PERMISOS.VER_ESTACIONES,
    PERMISOS.CONTROLAR_COMPUERTAS,
    PERMISOS.CONTROLAR_BOMBAS,
    PERMISOS.GENERAR_REPORTES,
    PERMISOS.VER_ESTADISTICAS,
    PERMISOS.EXPORTAR_DATOS
  ],

  [ROLES.VISUALIZADOR]: [
    PERMISOS.VER_ESTACIONES,
    PERMISOS.VER_ESTADISTICAS
  ]
};

/**
 * Middleware para verificar token JWT
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logger.security('Intento de acceso sin token', { ip: req.ip, path: req.path });
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.security('Token inválido', { ip: req.ip, error: err.message });
        return res.status(403).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      // Agregar datos del usuario al request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        nombre: decoded.nombre
      };

      logger.debug('Usuario autenticado', { userId: decoded.id, rol: decoded.rol });
      next();
    });
  } catch (error) {
    logger.error('Error en autenticación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Middleware para verificar rol específico
 * @param {...string} rolesPermitidos - Roles que pueden acceder
 * @returns {Function}
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      logger.security('Acceso denegado por rol', {
        userId: req.user.id,
        rol: req.user.rol,
        rolesRequeridos: rolesPermitidos,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'No tiene permisos suficientes para esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permiso específico
 * @param {string} permiso - Permiso requerido
 * @returns {Function}
 */
const requirePermission = (permiso) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const permisosUsuario = PERMISOS_POR_ROL[req.user.rol] || [];

    if (!permisosUsuario.includes(permiso)) {
      logger.security('Acceso denegado por permiso', {
        userId: req.user.id,
        rol: req.user.rol,
        permisoRequerido: permiso,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para permitir solo administradores
 */
const requireAdmin = requireRole(ROLES.ADMINISTRADOR);

/**
 * Middleware para permitir administradores y operadores
 */
const requireOperador = requireRole(ROLES.ADMINISTRADOR, ROLES.OPERADOR);

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {string} rol - Rol del usuario
 * @param {string} permiso - Permiso a verificar
 * @returns {boolean}
 */
const tienePermiso = (rol, permiso) => {
  const permisosRol = PERMISOS_POR_ROL[rol] || [];
  return permisosRol.includes(permiso);
};

/**
 * Obtiene todos los permisos de un rol
 * @param {string} rol - Rol del usuario
 * @returns {Array}
 */
const getPermisos = (rol) => {
  return PERMISOS_POR_ROL[rol] || [];
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  requireAdmin,
  requireOperador,
  tienePermiso,
  getPermisos,
  ROLES,
  PERMISOS,
  PERMISOS_POR_ROL
};
