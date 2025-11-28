/**
 * Configuración de InfluxDB 2.x
 * Sistema de Telemetría y Automatización San Javier (STA-SB)
 */

const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { DeleteAPI, BucketsAPI, OrgsAPI } = require('@influxdata/influxdb-client-apis');
const logger = require('./logger');

// Configuración de InfluxDB
const url = process.env.INFLUX_URL || 'http://localhost:8086';
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG || 'CEA_Project_SPA';
const bucket = process.env.INFLUX_BUCKET || 'sta_sb_telemetria';

// Cliente de InfluxDB
const influxDB = new InfluxDB({ url, token });

/**
 * Obtiene el API de escritura
 * @returns {WriteApi}
 */
const getWriteApi = () => {
  const writeApi = influxDB.getWriteApi(org, bucket);

  // Configuraciones de escritura
  writeApi.useDefaultTags({
    proyecto: 'STA-SB',
    cliente: 'OUA_San_Javier'
  });

  return writeApi;
};

/**
 * Obtiene el API de consulta
 * @returns {QueryApi}
 */
const getQueryApi = () => {
  return influxDB.getQueryApi(org);
};

/**
 * Obtiene el API de eliminación
 * @returns {DeleteAPI}
 */
const getDeleteApi = () => {
  return new DeleteAPI(influxDB);
};

/**
 * Escribe un punto de datos en InfluxDB
 * @param {string} measurement - Nombre de la medición
 * @param {Object} tags - Tags del punto
 * @param {Object} fields - Campos del punto
 * @param {Date} timestamp - Timestamp (opcional)
 * @returns {Promise}
 */
const writePoint = async (measurement, tags, fields, timestamp = null) => {
  const writeApi = getWriteApi();

  try {
    const point = new Point(measurement);

    // Agregar tags
    for (const [key, value] of Object.entries(tags)) {
      point.tag(key, String(value));
    }

    // Agregar fields
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          point.intField(key, value);
        } else {
          point.floatField(key, value);
        }
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, String(value));
      }
    }

    // Timestamp opcional
    if (timestamp) {
      point.timestamp(timestamp);
    }

    writeApi.writePoint(point);
    await writeApi.flush();

    logger.debug('Punto escrito en InfluxDB', { measurement, tags, fields });

  } catch (error) {
    logger.error('Error escribiendo en InfluxDB:', error.message);
    throw error;
  } finally {
    await writeApi.close();
  }
};

/**
 * Escribe múltiples puntos en InfluxDB (batch)
 * @param {Array} points - Array de objetos con {measurement, tags, fields, timestamp}
 * @returns {Promise}
 */
const writePoints = async (points) => {
  const writeApi = getWriteApi();

  try {
    for (const pointData of points) {
      const point = new Point(pointData.measurement);

      // Tags
      for (const [key, value] of Object.entries(pointData.tags || {})) {
        point.tag(key, String(value));
      }

      // Fields
      for (const [key, value] of Object.entries(pointData.fields)) {
        if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            point.intField(key, value);
          } else {
            point.floatField(key, value);
          }
        } else if (typeof value === 'boolean') {
          point.booleanField(key, value);
        } else {
          point.stringField(key, String(value));
        }
      }

      // Timestamp
      if (pointData.timestamp) {
        point.timestamp(pointData.timestamp);
      }

      writeApi.writePoint(point);
    }

    await writeApi.flush();
    logger.debug(`${points.length} puntos escritos en InfluxDB`);

  } catch (error) {
    logger.error('Error escribiendo batch en InfluxDB:', error.message);
    throw error;
  } finally {
    await writeApi.close();
  }
};

/**
 * Ejecuta una consulta Flux
 * @param {string} fluxQuery - Consulta Flux
 * @returns {Promise<Array>}
 */
const query = async (fluxQuery) => {
  const queryApi = getQueryApi();
  const rows = [];

  try {
    await queryApi.collectRows(fluxQuery, (row, tableMeta) => {
      const o = tableMeta.toObject(row);
      rows.push(o);
    });

    logger.debug('Query Flux ejecutada', { rows: rows.length });
    return rows;

  } catch (error) {
    logger.error('Error ejecutando query Flux:', error.message);
    throw error;
  }
};

/**
 * Obtiene datos de sensores de una estación en un rango de tiempo
 * @param {string} estacionId - ID de la estación
 * @param {string} tipoSensor - Tipo de sensor (opcional)
 * @param {string} rangoTiempo - Rango de tiempo (ej: '-1h', '-24h', '-7d')
 * @returns {Promise<Array>}
 */
const getSensorData = async (estacionId, tipoSensor = null, rangoTiempo = '-1h') => {
  let fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${rangoTiempo})
      |> filter(fn: (r) => r["_measurement"] == "datos_sensor")
      |> filter(fn: (r) => r["estacion_id"] == "${estacionId}")
  `;

  if (tipoSensor) {
    fluxQuery += `
      |> filter(fn: (r) => r["tipo_sensor"] == "${tipoSensor}")
    `;
  }

  fluxQuery += `
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> sort(columns: ["_time"], desc: true)
  `;

  return await query(fluxQuery);
};

/**
 * Obtiene estadísticas de una estación
 * @param {string} estacionId - ID de la estación
 * @param {string} rangoTiempo - Rango de tiempo
 * @returns {Promise<Array>}
 */
const getStationStats = async (estacionId, rangoTiempo = '-24h') => {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${rangoTiempo})
      |> filter(fn: (r) => r["_measurement"] == "datos_sensor")
      |> filter(fn: (r) => r["estacion_id"] == "${estacionId}")
      |> filter(fn: (r) => r["_field"] == "valor")
      |> group(columns: ["tipo_sensor"])
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  `;

  return await query(fluxQuery);
};

/**
 * Verifica la conexión a InfluxDB
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const bucketsAPI = new BucketsAPI(influxDB);
    const buckets = await bucketsAPI.getBuckets({ org });

    const bucketExists = buckets.buckets?.some(b => b.name === bucket);

    if (bucketExists) {
      logger.info('Conexión InfluxDB exitosa:', {
        url,
        org,
        bucket,
        status: 'connected'
      });
      return true;
    } else {
      logger.warn(`Bucket '${bucket}' no encontrado en InfluxDB`);
      return false;
    }
  } catch (error) {
    logger.error('Error conectando a InfluxDB:', error.message);
    return false;
  }
};

/**
 * Cierra las conexiones de InfluxDB
 */
const close = async () => {
  logger.info('Conexión InfluxDB cerrada');
};

module.exports = {
  influxDB,
  getWriteApi,
  getQueryApi,
  getDeleteApi,
  writePoint,
  writePoints,
  query,
  getSensorData,
  getStationStats,
  testConnection,
  close,
  Point // Exportar Point para uso directo
};
