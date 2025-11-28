/**
 * Modelo de Usuario
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

class Usuario {
  /**
   * Obtiene todos los usuarios
   * @param {Object} filtros - Filtros opcionales {rol, activo}
   * @returns {Promise<Array>}
   */
  static async getAll(filtros = {}) {
    try {
      let query = `
        SELECT id, email, nombre, rol, activo,
               ultimo_acceso, created_at, updated_at
        FROM telemetria_sta.usuarios
        WHERE 1=1
      `;
      const params = [];

      if (filtros.rol) {
        params.push(filtros.rol);
        query += ` AND rol = $${params.length}`;
      }

      if (filtros.activo !== undefined) {
        params.push(filtros.activo);
        query += ` AND activo = $${params.length}`;
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const query = `
        SELECT id, email, nombre, rol, activo,
               ultimo_acceso, created_at, updated_at
        FROM telemetria_sta.usuarios
        WHERE id = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo usuario por ID:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene un usuario por email (con password para autenticación)
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>}
   */
  // static async getByEmail(email) {
  //   try {
  //     const query = `
  //       SELECT id, email, password, nombre, apellido, rol, activo,
  //              intentos_fallidos, bloqueado_hasta, ultimo_acceso
  //       FROM telemetria_sta.usuarios
  //       WHERE email = $1
  //     `;
  //     const result = await db.query(query, [email]);
  //     return result.rows[0] || null;
  //   } catch (error) {
  //     logger.error('Error obteniendo usuario por email:', error.message);
  //     throw error;
  //   }
  // }

  static async getByEmail(email) {
  try {
    const query = `
      SELECT id, email, password_hash as password, nombre, rol, activo, ultimo_acceso
      FROM telemetria_sta.usuarios
      WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error obteniendo usuario por email:', error.message);
    throw error;
  }
}

  /**
   * Crea un nuevo usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      // Hash del password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const query = `
        INSERT INTO telemetria_sta.usuarios
        (email, password, nombre, rol, activo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, nombre, rol, activo, created_at
      `;

const params = [
  data.email.toLowerCase(),
  hashedPassword,
  data.nombre,
  data.rol || 'visualizador',
  data.activo !== undefined ? data.activo : true
];

      const result = await db.query(query, params);
      logger.info(`Usuario creado: ${data.email}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando usuario:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza un usuario
   * @param {number} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    try {
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (data.nombre !== undefined) {
        params.push(data.nombre);
        updates.push(`nombre = $${paramCount++}`);
      }
      // if (data.apellido !== undefined) {
      //   params.push(data.apellido);
      //   updates.push(`apellido = $${paramCount++}`);
      // }
      if (data.rol !== undefined) {
        params.push(data.rol);
        updates.push(`rol = $${paramCount++}`);
      }
      if (data.activo !== undefined) {
        params.push(data.activo);
        updates.push(`activo = $${paramCount++}`);
      }
if (data.password !== undefined) {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  params.push(hashedPassword);
  updates.push(`password_hash = $${paramCount++}`);
}

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const query = `
        UPDATE telemetria_sta.usuarios
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, nombre, rol, activo, updated_at
      `;

      const result = await db.query(query, params);
      logger.info(`Usuario actualizado: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando usuario:', error.message);
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM telemetria_sta.usuarios WHERE id = $1 RETURNING id';
      const result = await db.query(query, [id]);
      logger.info(`Usuario eliminado: ${id}`);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error eliminando usuario:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si el password es correcto
   * @param {string} password - Password en texto plano
   * @param {string} hashedPassword - Password hasheado
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error verificando password:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza el último acceso del usuario
   * @param {number} id - ID del usuario
   * @returns {Promise}
   */
  static async updateUltimoAcceso(id) {
    try {
      const query = `
        UPDATE telemetria_sta.usuarios
        SET ultimo_acceso = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await db.query(query, [id]);
    } catch (error) {
      logger.error('Error actualizando último acceso:', error.message);
      throw error;
    }
  }

  /**
   * Incrementa intentos fallidos de login
   * @param {string} email - Email del usuario
   * @returns {Promise}
   */
  static async incrementarIntentosFallidos(email) {
    // try {
    //   const maxIntentos = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
    //   const lockoutTime = parseInt(process.env.LOCKOUT_TIME || '900000'); // 15 min

    //   const query = `
    //     UPDATE telemetria_sta.usuarios
    //     SET
    //       intentos_fallidos = intentos_fallidos + 1,
    //       bloqueado_hasta = CASE
    //         WHEN intentos_fallidos + 1 >= $1
    //         THEN CURRENT_TIMESTAMP + INTERVAL '${lockoutTime} milliseconds'
    //         ELSE bloqueado_hasta
    //       END
    //     WHERE email = $2
    //     RETURNING intentos_fallidos, bloqueado_hasta
    //   `;

    //   const result = await db.query(query, [maxIntentos, email]);
    //   logger.security('Intento fallido de login', { email, intentos: result.rows[0]?.intentos_fallidos });
    //   return result.rows[0];


    logger.warn('Intento fallido de login:', email);
    return null;
    } catch (error) {
      logger.error('Error incrementando intentos fallidos:', error.message);
      throw error;
    }
  }

  /**
   * Resetea intentos fallidos de login
   * @param {string} email - Email del usuario
   * @returns {Promise}
   */
  // static async resetearIntentosFallidos(email) {
  //   try {
  //     const query = `
  //       UPDATE telemetria_sta.usuarios
  //       SET intentos_fallidos = 0, bloqueado_hasta = NULL
  //       WHERE email = $1
  //     `;
  //     await db.query(query, [email]);
  //   } catch (error) {
  //     logger.error('Error reseteando intentos fallidos:', error.message);
  //     throw error;
  //   }
  // }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Object>}
   */
//   static async getEstadisticas() {
//     try {
//       const query = `
//         SELECT
//           COUNT(*) as total,
//           COUNT(*) FILTER (WHERE activo = true) as activos,
//           COUNT(*) FILTER (WHERE rol = 'administrador') as administradores,
//           COUNT(*) FILTER (WHERE rol = 'operador') as operadores,
//           COUNT(*) FILTER (WHERE rol = 'visualizador') as visualizadores
//         FROM telemetria_sta.usuarios
//       `;
//       const result = await db.query(query);
//       return result.rows[0];
//     } catch (error) {
//       logger.error('Error obteniendo estadísticas de usuarios:', error.message);
//       throw error;
//     }
//   }
// }

module.exports = Usuario;
