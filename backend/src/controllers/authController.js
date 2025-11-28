/**
 * Controlador de Autenticación
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const logger = require('../config/logger');
const { getPermisos } = require('../middleware/auth');

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.getByEmail(email.toLowerCase());

    if (!usuario) {
      logger.security('Intento de login con email inexistente', { email });
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está bloqueado
    if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
      const tiempoRestante = Math.ceil((new Date(usuario.bloqueado_hasta) - new Date()) / 1000 / 60);
      logger.security('Intento de login con usuario bloqueado', { email, tiempoRestante });

      return res.status(423).json({
        success: false,
        message: `Usuario bloqueado temporalmente. Intente en ${tiempoRestante} minutos`
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      logger.security('Intento de login con usuario inactivo', { email });
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado. Contacte al administrador'
      });
    }

    // Verificar password
    const passwordValido = await Usuario.verifyPassword(password, usuario.password);

    if (!passwordValido) {
      await Usuario.incrementarIntentosFallidos(email);
      logger.security('Intento de login con password inválido', { email });

      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Login exitoso: resetear intentos fallidos
    // await Usuario.resetearIntentosFallidos(email);
    await Usuario.updateUltimoAcceso(usuario.id);

    // Generar tokens JWT
    const tokenPayload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    logger.info('Login exitoso', { userId: usuario.id, email: usuario.email });
    logger.audit(usuario.id, 'login', { ip: req.ip });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          // apellido: usuario.apellido,
          rol: usuario.rol
        },
        accessToken,
        refreshToken,
        permisos: getPermisos(usuario.rol)
      }
    });

  } catch (error) {
    logger.error('Error en login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Logout de usuario
 */
const logout = async (req, res) => {
  try {
    logger.audit(req.user.id, 'logout', { ip: req.ip });

    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    logger.error('Error en logout:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Obtiene información del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.user.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...usuario,
        permisos: getPermisos(usuario.rol)
      }
    });

  } catch (error) {
    logger.error('Error obteniendo perfil:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Actualiza el perfil del usuario autenticado
 */
const updateProfile = async (req, res) => {
  try {
    const { nombre, apellido, password } = req.body;
    const updateData = {};

    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (password) updateData.password = password;

    const usuarioActualizado = await Usuario.update(req.user.id, updateData);

    logger.audit(req.user.id, 'update_profile', { campos: Object.keys(updateData) });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: usuarioActualizado
    });

  } catch (error) {
    logger.error('Error actualizando perfil:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

/**
 * Refresca el access token usando el refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Refresh token inválido o expirado'
        });
      }

      const usuario = await Usuario.getById(decoded.id);

      if (!usuario || !usuario.activo) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no válido'
        });
      }

      const tokenPayload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: `${usuario.nombre} ${usuario.apellido}`
      };

      const newAccessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken
        }
      });
    });

  } catch (error) {
    logger.error('Error refrescando token:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile,
  updateProfile,
  refreshToken
};
