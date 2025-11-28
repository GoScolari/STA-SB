/**
 * Controlador de Estaciones
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const Estacion = require('../models/Estacion');
const influx = require('../config/influx');
const logger = require('../config/logger');

/**
 * Obtiene todas las estaciones
 */
const getEstaciones = async (req, res) => {
  try {
    const { activo, tipo } = req.query;
    const filtros = {};

    if (activo !== undefined) {
      filtros.activo = activo === 'true';
    }

    if (tipo) {
      filtros.tipo = tipo;
    }

    const estaciones = await Estacion.getAll(filtros);

    res.json({
      success: true,
      data: estaciones,
      total: estaciones.length
    });

  } catch (error) {
    logger.error('Error obteniendo estaciones:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estaciones'
    });
  }
};

/**
 * Obtiene una estación por ID
 */
const getEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    const estacion = await Estacion.getById(id);

    if (!estacion) {
      return res.status(404).json({
        success: false,
        message: 'Estación no encontrada'
      });
    }

    // Obtener sensores de la estación
    const sensores = await Estacion.getSensores(id);

    res.json({
      success: true,
      data: {
        ...estacion,
        sensores
      }
    });

  } catch (error) {
    logger.error('Error obteniendo estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estación'
    });
  }
};

/**
 * Crea una nueva estación
 */
const createEstacion = async (req, res) => {
  try {
    const estacion = await Estacion.create(req.body);

    logger.audit(req.user.id, 'create_station', { stationId: estacion.id, codigo: estacion.codigo });

    res.status(201).json({
      success: true,
      message: 'Estación creada correctamente',
      data: estacion
    });

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        message: 'Ya existe una estación con ese código'
      });
    }

    logger.error('Error creando estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creando estación'
    });
  }
};

/**
 * Actualiza una estación
 */
const updateEstacion = async (req, res) => {
  try {
    const { id } = req.params;

    const estacion = await Estacion.getById(id);
    if (!estacion) {
      return res.status(404).json({
        success: false,
        message: 'Estación no encontrada'
      });
    }

    const estacionActualizada = await Estacion.update(id, req.body);

    logger.audit(req.user.id, 'update_station', {
      stationId: id,
      campos: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Estación actualizada correctamente',
      data: estacionActualizada
    });

  } catch (error) {
    logger.error('Error actualizando estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estación'
    });
  }
};

/**
 * Elimina una estación
 */
const deleteEstacion = async (req, res) => {
  try {
    const { id } = req.params;

    const estacion = await Estacion.getById(id);
    if (!estacion) {
      return res.status(404).json({
        success: false,
        message: 'Estación no encontrada'
      });
    }

    await Estacion.delete(id);

    logger.audit(req.user.id, 'delete_station', {
      stationId: id,
      codigo: estacion.codigo
    });

    res.json({
      success: true,
      message: 'Estación eliminada correctamente'
    });

  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar la estación porque tiene datos asociados'
      });
    }

    logger.error('Error eliminando estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error eliminando estación'
    });
  }
};

/**
 * Obtiene datos de sensores de una estación
 */
const getDatosEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipoSensor, rango = '-1h' } = req.query;

    const estacion = await Estacion.getById(id);
    if (!estacion) {
      return res.status(404).json({
        success: false,
        message: 'Estación no encontrada'
      });
    }

    const datos = await influx.getSensorData(
      estacion.codigo,
      tipoSensor,
      rango
    );

    res.json({
      success: true,
      data: {
        estacion: {
          id: estacion.id,
          codigo: estacion.codigo,
          nombre: estacion.nombre
        },
        rango,
        tipoSensor: tipoSensor || 'todos',
        datos,
        total: datos.length
      }
    });

  } catch (error) {
    logger.error('Error obteniendo datos de estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo datos de estación'
    });
  }
};

/**
 * Obtiene estadísticas de una estación
 */
const getEstadisticasEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rango = '-24h' } = req.query;

    const estacion = await Estacion.getById(id);
    if (!estacion) {
      return res.status(404).json({
        success: false,
        message: 'Estación no encontrada'
      });
    }

    const stats = await influx.getStationStats(estacion.codigo, rango);

    res.json({
      success: true,
      data: {
        estacion: {
          id: estacion.id,
          codigo: estacion.codigo,
          nombre: estacion.nombre
        },
        rango,
        estadisticas: stats
      }
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas de estación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

/**
 * Obtiene estadísticas generales de todas las estaciones
 */
const getEstadisticasGenerales = async (req, res) => {
  try {
    const stats = await Estacion.getEstadisticas();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas generales:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

module.exports = {
  getEstaciones,
  getEstacion,
  createEstacion,
  updateEstacion,
  deleteEstacion,
  getDatosEstacion,
  getEstadisticasEstacion,
  getEstadisticasGenerales
};
