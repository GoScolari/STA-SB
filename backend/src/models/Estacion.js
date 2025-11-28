/**
 * Modelo de Estación de Telemetría
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const db = require('../config/database');
const logger = require('../config/logger');

class Estacion {
  /**
   * Obtiene todas las estaciones
   * @param {Object} filtros - Filtros opcionales {activo, tipo}
   * @returns {Promise<Array>}
   */
  static async getAll(filtros = {}) {
    try {
      let query = 'SELECT * FROM telemetria_sta.estaciones WHERE 1=1';
      const params = [];

      if (filtros.activo !== undefined) {
        params.push(filtros.activo);
        query += ` AND estado = $${params.length}`;
      }

      if (filtros.tipo) {
        params.push(filtros.tipo);
        query += ` AND tipo_estacion = $${params.length}`;
      }

      query += ' ORDER BY nombre ASC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo estaciones:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene una estación por ID
   * @param {number} id - ID de la estación
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const query = 'SELECT * FROM telemetria_sta.estaciones WHERE id = $1';
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo estación por ID:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene una estación por código
   * @param {string} codigo - Código de la estación
   * @returns {Promise<Object>}
   */
  static async getByCodigo(codigo) {
    try {
      const query = 'SELECT * FROM telemetria_sta.estaciones WHERE codigo = $1';
      const result = await db.query(query, [codigo]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error obteniendo estación por código:', error.message);
      throw error;
    }
  }

  /**
   * Crea una nueva estación
   * @param {Object} data - Datos de la estación
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO telemetria_sta.estaciones
        (codigo, nombre, descripcion, latitud, longitud, tipo_estacion, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const params = [
        data.codigo,
        data.nombre,
        data.descripcion || null,
        data.latitud || null,
        data.longitud || null,
        data.tipo_estacion || 'monitoreo',
        data.estado !== undefined ? data.estado : true
      ];

      const result = await db.query(query, params);
      logger.info(`Estación creada: ${data.codigo}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creando estación:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza una estación
   * @param {number} id - ID de la estación
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    try {
      const updates = [];
      const params = [];
      let paramCount = 1;

      // Construir query dinámica
      if (data.nombre !== undefined) {
        params.push(data.nombre);
        updates.push(`nombre = $${paramCount++}`);
      }
      if (data.descripcion !== undefined) {
        params.push(data.descripcion);
        updates.push(`descripcion = $${paramCount++}`);
      }
      if (data.latitud !== undefined) {
        params.push(data.latitud);
        updates.push(`latitud = $${paramCount++}`);
      }
      if (data.longitud !== undefined) {
        params.push(data.longitud);
        updates.push(`longitud = $${paramCount++}`);
      }
      if (data.tipo_estacion !== undefined) {
        params.push(data.tipo_estacion);
        updates.push(`tipo_estacion = $${paramCount++}`);
      }
      if (data.estado !== undefined) {
        params.push(data.estado);
        updates.push(`estado = $${paramCount++}`);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const query = `
        UPDATE telemetria_sta.estaciones
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, params);
      logger.info(`Estación actualizada: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error actualizando estación:', error.message);
      throw error;
    }
  }

  /**
   * Elimina una estación
   * @param {number} id - ID de la estación
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM telemetria_sta.estaciones WHERE id = $1 RETURNING id';
      const result = await db.query(query, [id]);
      logger.info(`Estación eliminada: ${id}`);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error eliminando estación:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene sensores de una estación
   * @param {number} estacionId - ID de la estación
   * @returns {Promise<Array>}
   */
  static async getSensores(estacionId) {
    try {
      const query = `
        SELECT * FROM telemetria_sta.sensores
        WHERE estacion_id = $1
        ORDER BY tipo_sensor ASC
      `;
      const result = await db.query(query, [estacionId]);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo sensores de estación:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de todas las estaciones
   * @returns {Promise<Object>}
   */
  static async getEstadisticas() {
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = true) as activas,
          COUNT(*) FILTER (WHERE estado = false) as inactivas,
          COUNT(DISTINCT tipo_estacion) as tipos
        FROM telemetria_sta.estaciones
      `;
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error obteniendo estadísticas de estaciones:', error.message);
      throw error;
    }
  }
}

module.exports = Estacion;
